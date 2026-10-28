// GLSL shaders para sa glossy-paper effect ng bawat card.

export const vertexShader = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vUv = uv;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

export const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uOpacity;
  uniform float uGlossEnergy;
  uniform float uNarrowGloss;
  uniform float uGlossShift;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vViewDirection;

  void main() {
    vec2 sampleUv = clamp(vUv, vec2(0.001), vec2(0.999));
    vec4 color = texture2D(uTexture, sampleUv);
    float glossEnergy = clamp(uGlossEnergy, 0.0, 1.0);
    float narrowEnergy = clamp(uNarrowGloss, 0.0, 1.0);
    vec3 normal = normalize(vWorldNormal);
    vec3 viewDirection = normalize(vViewDirection);
    float facing = clamp(abs(dot(normal, viewDirection)), 0.0, 1.0);
    float grazing = pow(1.0 - facing, 1.75);
    float laminate = pow(facing, 0.45);
    float baseSheenAxis = sampleUv.x + sampleUv.y * 0.18;
    float baseCenter = 0.5 + (uGlossShift - 0.5) * 0.26;
    float baseGloss = exp(-pow((baseSheenAxis - baseCenter) / 0.28, 2.0)) * glossEnergy * (0.08 + laminate * 0.08 + grazing * 0.04);
    float narrowSheenAxis = sampleUv.x + sampleUv.y * 0.34;
    float narrowSheenCenter = 0.42 + (uGlossShift - 0.5) * 0.3;
    float narrowGloss = exp(-pow((narrowSheenAxis - narrowSheenCenter) / 0.13, 2.0)) * narrowEnergy * (0.04 + grazing * 0.1);
    float topReflection = smoothstep(0.64, 1.0, sampleUv.y) * smoothstep(0.05, 0.55, sampleUv.x) * glossEnergy * grazing * 0.05;
    float centerMask = smoothstep(0.0, 0.18, sampleUv.x) * (1.0 - smoothstep(0.82, 1.0, sampleUv.x));
    float edgeShadow = (1.0 - centerMask) * glossEnergy * 0.04;
    float edgeVignette = smoothstep(0.0, 0.1, min(min(sampleUv.x, 1.0 - sampleUv.x), min(sampleUv.y, 1.0 - sampleUv.y)));

    color.rgb *= 1.0 + glossEnergy * 0.03;
    color.rgb *= 1.0 - edgeShadow;
    color.rgb *= mix(0.96, 1.0, edgeVignette);
    color.rgb += vec3(1.0) * (baseGloss + narrowGloss + topReflection);
    color.a *= uOpacity;

    if (color.a <= 0.002) {
      discard;
    }

    gl_FragColor = color;

    #include <colorspace_fragment>
  }
`
