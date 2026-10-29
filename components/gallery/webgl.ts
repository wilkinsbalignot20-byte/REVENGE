import type { Project } from "./projects";

export type Motion = {
  offset: number;
  velocity: number;
  present: number;
  targetPresent: number;
  pointerX: number;
  pointerY: number;
  parallaxX: number;
  parallaxY: number;
};

export type Conveyor = {
  draw: (state: Motion, picking?: boolean) => void;
  resize: (width: number, height: number) => void;
  pick: (x: number, y: number, state: Motion) => number;
};

export type Noise = {
  resize: () => void;
  draw: (time: number) => void;
};

export function wrap(value: number, period: number) {
  return ((value % period) + period) % period;
}

export function advanceMotion(
  state: Motion,
  frames: number,
  count: number,
  reduced: boolean
) {
  const decay = Math.pow(0.94, frames);
  // Integrate exponential damping so 60Hz and 120Hz travel the same distance.
  state.offset = wrap(
    state.offset + (reduced ? 0 : (state.velocity * 0.94 * (1 - decay)) / 0.06),
    count
  );
  state.velocity = reduced ? 0 : state.velocity * decay;
  state.present +=
    (state.targetPresent - state.present) *
    (reduced ? 1 : 1 - Math.pow(0.93, frames));
  const smoothing = 1 - Math.pow(0.968, frames);
  state.parallaxX = reduced
    ? 0
    : state.parallaxX + (state.pointerX - state.parallaxX) * smoothing;
  state.parallaxY = reduced
    ? 0
    : state.parallaxY + (state.pointerY - state.parallaxY) * smoothing;
}

export function layoutViewport(width: number, height: number) {
  const scale = height / 1080;
  return { scale, width: width / scale };
}

function conveyorPoint(t: number) {
  const half = 2.9,
    radius = 1.02,
    straight = half * 2,
    arc = Math.PI * radius;
  let distance = wrap(t, 1) * (straight * 2 + arc * 2);
  if (distance < straight)
    return { y: -half + distance, z: radius, ny: 0, nz: 1 };
  distance -= straight;
  if (distance < arc) {
    const angle = Math.PI / 2 - distance / radius;
    return {
      y: half + Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      ny: Math.cos(angle),
      nz: Math.sin(angle),
    };
  }
  distance -= arc;
  if (distance < straight)
    return { y: half - distance, z: -radius, ny: 0, nz: -1 };
  distance -= straight;
  const angle = -Math.PI / 2 - distance / radius;
  return {
    y: -half + Math.cos(angle) * radius,
    z: Math.sin(angle) * radius,
    ny: Math.cos(angle),
    nz: Math.sin(angle),
  };
}

function buildConveyorGeometry(count: number, segments = 256) {
  // Match each texture's 4:3 aspect without extra subdivisions across a flat width.
  const width = (((11.6 + Math.PI * 2.04) / count) * 4) / 3;
  const vertices = new Float32Array((segments + 1) * 2 * 7);
  const indices = new Uint16Array(segments * 6);
  for (let i = 0; i <= segments; i++) {
    const point = conveyorPoint(i / segments);
    for (let side = 0; side < 2; side++) {
      vertices.set(
        [(side - 0.5) * width, point.y, point.z, side, i / segments, point.ny, point.nz],
        (i * 2 + side) * 7
      );
    }
    if (i < segments) {
      const a = i * 2;
      indices.set([a, a + 2, a + 1, a + 1, a + 2, a + 3], i * 6);
    }
  }
  return { vertices, indices };
}

export function createConveyor(
  canvas: HTMLCanvasElement,
  images: (HTMLImageElement | null)[],
  projects: Project[]
): Conveyor {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    premultipliedAlpha: false,
  });
  if (!gl) throw new Error("WebGL is unavailable.");

  const vertexSource = `
    attribute vec3 position;
    attribute vec2 uv;
    attribute vec2 normalYZ;
    uniform vec3 rotation, rig, camera, target;
    uniform vec3 translation;
    uniform float aspect;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition, vView, vLight;
    vec3 rotate(vec3 p, vec3 r) {
      vec3 c = cos(r), s = sin(r);
      p.xy = mat2(c.z, s.z, -s.z, c.z) * p.xy;
      p.xz = mat2(c.y, -s.y, s.y, c.y) * p.xz;
      p.yz = mat2(c.x, s.x, -s.x, c.x) * p.yz;
      return p;
    }
    vec3 unrotate(vec3 p, vec3 r) {
      vec3 c = cos(r), s = sin(r);
      p.yz = mat2(c.x, -s.x, s.x, c.x) * p.yz;
      p.xz = mat2(c.y, s.y, -s.y, c.y) * p.xz;
      p.xy = mat2(c.z, -s.z, s.z, c.z) * p.xy;
      return p;
    }
    void main() {
      vUv = uv;
      vNormal = rotate(rotate(vec3(0.0, normalYZ), rotation), rig);
      vPosition = position;
      vLight = unrotate(unrotate(normalize(vec3(-0.45, 1.1, 0.8)), rig), rotation);
      vec3 world = rotate(rotate(position * 0.79, rotation), rig) + translation;
      vView = camera - world;
      vec3 forward = normalize(target - camera);
      vec3 right = normalize(cross(forward, vec3(0.0, 1.0, 0.0)));
      vec3 up = cross(right, forward);
      vec3 delta = world - camera;
      vec3 view = vec3(dot(delta, right), dot(delta, up), -dot(delta, forward));
      view.xy *= 1.122;
      gl_Position = vec4(view.x * 3.2708526 / aspect, view.y * 3.2708526, -1.002002 * view.z - 0.2002002, -view.z);
      gl_Position.y += gl_Position.w * 0.2;
    }`;

  const fragmentSource = `
    precision highp float;
    uniform sampler2D atlas;
    uniform float offset, count, picking;
    uniform vec2 grid, atlasSize;
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vPosition, vView, vLight;
    float edgeShadow(vec3 origin, vec3 ray, float distance) {
      if (distance < 0.025) return 0.0;
      float halfWidth = (11.6 + 6.408849) / count * 0.666667;
      float edge = halfWidth - abs(origin.x + ray.x * distance);
      return smoothstep(-0.06, 0.06 + distance * 0.12, edge);
    }
    float rayShadow(vec3 origin, vec3 ray) {
      float shadow = 0.0;
      if (abs(ray.z) > 0.0001) {
        for (int side = 0; side < 2; side++) {
          float z = side == 0 ? -1.02 : 1.02;
          float distance = (z - origin.z) / ray.z;
          if (abs(origin.y + ray.y * distance) <= 2.9)
            shadow = max(shadow, edgeShadow(origin, ray, distance));
        }
      }
      float a = dot(ray.yz, ray.yz);
      for (int end = 0; end < 2; end++) {
        float signY = end == 0 ? -1.0 : 1.0;
        vec2 delta = origin.yz - vec2(signY * 2.9, 0.0);
        float b = dot(delta, ray.yz);
        float discriminant = b * b - a * (dot(delta, delta) - 1.0404);
        if (discriminant >= 0.0 && a > 0.0001) {
          for (int root = 0; root < 2; root++) {
            float distance = (-b + (root == 0 ? -1.0 : 1.0) * sqrt(discriminant)) / a;
            if (signY * (origin.y + ray.y * distance) >= 2.9)
              shadow = max(shadow, edgeShadow(origin, ray, distance));
          }
        }
      }
      return shadow;
    }
    float visibility(vec3 normal) {
      vec3 light = normalize(vLight);
      vec3 tangent = normalize(cross(light, vec3(0.0, 1.0, 0.0)));
      vec3 bitangent = cross(light, tangent);
      vec3 origin = vPosition + normal * 0.018;
      float shadow = rayShadow(origin, light) * 2.0;
      shadow += rayShadow(origin, normalize(light + tangent * 0.12));
      shadow += rayShadow(origin, normalize(light - tangent * 0.12));
      shadow += rayShadow(origin, normalize(light + bitangent * 0.12));
      shadow += rayShadow(origin, normalize(light - bitangent * 0.12));
      return 1.0 - shadow / 6.0;
    }
    void main() {
      float phase = mod(vUv.y * count + offset, count);
      float tile = floor(phase);
      if (picking > 0.5) { gl_FragColor = vec4((tile + 1.0) / 255.0, 0.0, 0.0, 1.0); return; }
      vec2 cell = vec2(mod(tile, grid.x), floor(tile / grid.x));
      vec2 local = vec2(vUv.x, 1.0 - fract(phase));
      vec2 inset = 0.5 * grid / atlasSize;
      vec2 sampleUv = (cell + mix(inset, 1.0 - inset, local)) / grid;
      vec3 color = texture2D(atlas, sampleUv).rgb;
      vec3 normal = normalize(vNormal);
      float side = dot(normal, vView) >= 0.0 ? 1.0 : -1.0;
      normal *= side;
      vec3 localNormal = vec3(0.0, normalize(vec2(vPosition.y - clamp(vPosition.y, -2.9, 2.9), vPosition.z))) * side;
      float visible = visibility(localNormal);
      vec3 light = normalize(vec3(-0.45, 1.1, 0.8));
      float diffuse = max(0.0, dot(normal, light)) * visible;
      float ambient = side > 0.0 ? 0.36 : 0.14;
      float fold = smoothstep(2.35, 3.92, abs(vPosition.y));
      ambient *= 1.0 - (side < 0.0 ? 0.35 : 0.12) * fold;
      float highlight = pow(max(0.0, dot(normal, normalize(light + normalize(vView)))), 28.0) * visible * 0.035;
      float luma = dot(color, vec3(0.299, 0.587, 0.114));
      color = max(vec3(0.0), mix(vec3(luma), color, 1.04));
      vec3 lit = pow(color, vec3(2.2)) * (ambient * vec3(0.94, 0.97, 1.0) + diffuse * 0.9 + highlight);
      gl_FragColor = vec4(pow(clamp(lit, 0.0, 1.0), vec3(1.0 / 2.2)), 1.0);
    }`;

  const program = gl.createProgram();
  if (!program) throw new Error("Could not create WebGL program.");
  const shaders: WebGLShader[] = [];
  try {
    for (const [type, source] of [
      [gl.VERTEX_SHADER, vertexSource],
      [gl.FRAGMENT_SHADER, fragmentSource],
    ] as const) {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Could not create shader.");
      shaders.push(shader);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader) ?? "Shader compile error.");
      gl.attachShader(program, shader);
    }
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) ?? "Program link error.");
  } catch (error) {
    gl.deleteProgram(program);
    throw error;
  } finally {
    shaders.forEach((shader) => gl.deleteShader(shader));
  }
  gl.useProgram(program);

  const geometry = buildConveyorGeometry(projects.length);
  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.STATIC_DRAW);
  for (const [name, size, start] of [
    ["position", 3, 0],
    ["uv", 2, 3],
    ["normalYZ", 2, 5],
  ] as const) {
    const attribute = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(attribute);
    gl.vertexAttribPointer(attribute, size, gl.FLOAT, false, 28, start * 4);
  }
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);

  // Pinagsasama ang lahat ng larawan sa isang atlas texture.
  const columns = Math.ceil(Math.sqrt(projects.length * 0.75));
  const rows = Math.ceil(projects.length / columns);
  const maxSize = Math.min(4096, gl.getParameter(gl.MAX_TEXTURE_SIZE));
  const tileWidth =
    Math.floor(
      Math.min(1200, maxSize / columns, ((maxSize / rows) * 4) / 3) / 4
    ) * 4;
  const tileHeight = tileWidth * 0.75;
  const atlas = document.createElement("canvas");
  atlas.width = columns * tileWidth;
  atlas.height = rows * tileHeight;
  const ctx = atlas.getContext("2d");
  if (!ctx) throw new Error("2D canvas is unavailable.");
  ctx.fillStyle = "#0f1316";
  ctx.fillRect(0, 0, atlas.width, atlas.height);
  images.forEach((image, index) => {
    const x = (index % columns) * tileWidth;
    const y = Math.floor(index / columns) * tileHeight;
    if (image) {
      const scale = Math.min(
        tileWidth / image.naturalWidth,
        tileHeight / image.naturalHeight
      );
      const width = image.naturalWidth * scale;
      const height = image.naturalHeight * scale;
      ctx.drawImage(
        image,
        x + (tileWidth - width) / 2,
        y + (tileHeight - height) / 2,
        width,
        height
      );
    } else {
      // Walang larawan: text tile na lang.
      ctx.fillStyle = "#8b9198";
      ctx.font = `${tileWidth / 24}px sans-serif`;
      ctx.fillText(projects[index].title, x + 24, y + tileHeight / 2, tileWidth - 48);
    }
  });

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas);
  const anisotropy = gl.getExtension("EXT_texture_filter_anisotropic");
  if (anisotropy) {
    gl.texParameterf(
      gl.TEXTURE_2D,
      anisotropy.TEXTURE_MAX_ANISOTROPY_EXT,
      Math.min(8, gl.getParameter(anisotropy.MAX_TEXTURE_MAX_ANISOTROPY_EXT))
    );
  }

  const locations = Object.fromEntries(
    [
      "rotation",
      "rig",
      "translation",
      "camera",
      "target",
      "aspect",
      "offset",
      "count",
      "picking",
      "grid",
      "atlasSize",
    ].map((name) => [name, gl.getUniformLocation(program, name)])
  );
  gl.uniform1f(locations.count, projects.length);
  gl.uniform2f(locations.grid, columns, rows);
  gl.uniform2f(locations.atlasSize, atlas.width, atlas.height);
  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0, 0, 0, 0);

  let viewportWidth = 1;
  let viewportHeight = 1;
  const pixel = new Uint8Array(4);

  function draw(state: Motion, picking = false) {
    if (!gl) return;
    const ease = state.present * state.present * (3 - 2 * state.present);
    const fade = 1 - ease;
    const x = state.parallaxX * fade;
    const y = state.parallaxY * fade;
    const zoom = Math.max(1, (0.9 * viewportHeight) / viewportWidth);
    gl.uniform3f(
      locations.camera,
      (-2 * fade + x * 0.12) * zoom,
      (-9.35 * fade - y * 0.08) * zoom,
      (10.99 - ease * 4.79) * zoom
    );
    gl.uniform3f(locations.target, 0, -0.2 * fade, 0.1 * fade);
    gl.uniform3f(
      locations.rotation,
      0.07 * fade,
      (-0.594 + Math.sin((state.offset * Math.PI * 2) / projects.length) * 0.081) * fade,
      -0.28 * fade
    );
    gl.uniform3f(locations.rig, -y * 0.075, x * 0.1, 0);
    gl.uniform3f(
      locations.translation,
      x * 0.075,
      y * 0.03 +
        Math.sin((state.offset * Math.PI * 4) / projects.length) * 0.02 -
        0.04 -
        ease * 0.06,
      0
    );
    gl.uniform1f(locations.offset, state.offset);
    gl.uniform1f(locations.picking, picking ? 1 : 0);
    if (picking) gl.disable(gl.DITHER);
    else gl.enable(gl.DITHER);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
  }

  return {
    draw,
    resize(width, height) {
      viewportWidth = width;
      viewportHeight = height;
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(locations.aspect, width / height);
    },
    pick(x, y, state) {
      draw(state, true);
      gl.readPixels(
        Math.min(canvas.width - 1, Math.max(0, Math.floor((x / viewportWidth) * canvas.width))),
        Math.min(
          canvas.height - 1,
          Math.max(0, Math.floor((1 - y / viewportHeight) * canvas.height))
        ),
        1,
        1,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixel
      );
      draw(state);
      return pixel[3] === 255 && pixel[0] > 0 && pixel[0] <= projects.length
        ? pixel[0] - 1
        : -1;
    },
  };
}

/** Static na noise texture na ginagawa sa 2D canvas (walang external file). */
export function staticNoise(canvas: HTMLCanvasElement) {
  const tile = document.createElement("canvas");
  tile.width = tile.height = 128;
  const ctx = tile.getContext("2d");
  if (ctx) {
    const data = ctx.createImageData(128, 128);
    for (let i = 0; i < data.data.length; i += 4) {
      const v = Math.random() * 255;
      data.data[i] = data.data[i + 1] = data.data[i + 2] = v;
      data.data[i + 3] = 255;
    }
    ctx.putImageData(data, 0, 0);
    canvas.style.backgroundImage = `url(${tile.toDataURL()})`;
  }
  canvas.style.backgroundSize = "128px 128px";
}

export function createNoise(canvas: HTMLCanvasElement): Noise {
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    depth: false,
    stencil: false,
  });
  const fallback = (reason: unknown): Noise => {
    console.warn("Shader grain is unavailable; using static noise.", reason);
    staticNoise(canvas);
    return { resize() {}, draw() {} };
  };
  if (!gl) return fallback("WebGL context was not available.");

  function compile(type: number, source: string) {
    const shader = gl!.createShader(type);
    if (!shader) throw new Error("Could not create shader.");
    gl!.shaderSource(shader, source);
    gl!.compileShader(shader);
    if (!gl!.getShaderParameter(shader, gl!.COMPILE_STATUS)) {
      const message = gl!.getShaderInfoLog(shader) ?? "Shader compile error.";
      gl!.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  let program: WebGLProgram | null = null;
  let vertex: WebGLShader | undefined;
  let fragment: WebGLShader | undefined;
  try {
    vertex = compile(
      gl.VERTEX_SHADER,
      `
      attribute vec2 position;
      void main() { gl_Position = vec4(position, 0.0, 1.0); }
    `
    );
    fragment = compile(
      gl.FRAGMENT_SHADER,
      `
      precision highp float;
      uniform float frame;
      float random(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      void main() {
        vec2 pixel = gl_FragCoord.xy + vec2(mod(frame, 997.0) * 17.0, mod(frame, 991.0) * 31.0);
        float grain = (random(pixel) + random(pixel + 19.7)
          + random(pixel + 43.1) + random(pixel + 71.9)) * 0.25;
        gl_FragColor = vec4(vec3(grain), 1.0);
      }
    `
    );
    program = gl.createProgram();
    if (!program) throw new Error("Could not create program.");
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program) ?? "Program link error.");
  } catch (error) {
    if (program) gl.deleteProgram(program);
    return fallback(error);
  } finally {
    if (vertex) gl.deleteShader(vertex);
    if (fragment) gl.deleteShader(fragment);
  }

  canvas.style.backgroundImage = "none";
  gl.useProgram(program);
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const position = gl.getAttribLocation(program, "position");
  gl.enableVertexAttribArray(position);
  gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
  const frame = gl.getUniformLocation(program, "frame");
  let previousFrame = -1;

  return {
    resize() {
      const ratio = 2;
      canvas.width = Math.round(document.documentElement.clientWidth * ratio);
      canvas.height = Math.round(document.documentElement.clientHeight * ratio);
      gl.viewport(0, 0, canvas.width, canvas.height);
      previousFrame = -1;
    },
    draw(time) {
      const currentFrame = Math.floor(time / 80);
      if (gl.isContextLost() || currentFrame === previousFrame) return;
      previousFrame = currentFrame;
      gl.uniform1f(frame, currentFrame);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
  };
}