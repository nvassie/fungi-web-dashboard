import { expose } from "comlink";

const customFunctionRunner = {
  async runFunction(functions: string[], input: number[][]) {
    try {
      let processedData = input;
      for (let i = 0; i < functions.length; i += 1) {
        const temp = [];
        for (let j = 0; j < processedData.length; j += 1) {
          const fn = new Function(
            "input",
            `
                  "use strict";
                  return (async () => {
                    ${functions[i]}
                  })();
                `,
          );
          const output = await fn(processedData[j]);
          temp.push(output);
        }
        processedData = temp;
      }
      return processedData;
    } catch (error) {
      return error;
    }
  },
};

expose(customFunctionRunner);
