 import { serve } from "inngest/next";
import { Inngest } from "inngest";

const inngest = new Inngest({ id: "mani" });

const testFunction = inngest.createFunction(
  {
    id: "test-endpoint",
    triggers: [{ event: "app/test.connection" }],
  },
  async ({ step }) => {
    return { status: "Gumagana ang Inngest!" };
  }
);


export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    testFunction, // 2. Idagdag ito rito temporarily
    /* Dito mo ilalagay ang mga totoong AI functions mo mamaya */
  ],
});
