import { expose } from "comlink";

const codeRunner = {
  async runCode(code: string, input: number[]) {
    try {
      const fn = new Function(
        "input",
        `
              "use strict";
              return (async () => {
                ${code}
              })();
            `,
      );
      const output = await fn(input);
      const filtered = input.map((item, i) =>
        output.includes(i) ? item : null,
      );
      return { spike: output, filtered };
    } catch (error) {
      return error;
    }
  },
};

expose(codeRunner);
