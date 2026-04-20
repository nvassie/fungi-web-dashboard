import { useEffect, useMemo, useRef } from "react";

const RUNNER_HTML = `
<!doctype html>
<html>
  <body>
    <script>
      function reply(message) {
        parent.postMessage(message, "*");
      }

      window.addEventListener("message", async (event) => {
        const msg = event.data;
        if (!msg || typeof msg !== "object") return;
        if (msg.type !== "EXECUTE") return;

        const { requestId, code, input } = msg;

        try {
          const fn = new Function(
            "input",
            \`
              "use strict";
              return (async () => {
                \${code}
              })();
            \`
          );

          const output = await fn(input);

          reply({
            type: "EXECUTE_RESULT",
            requestId,
            ok: true,
            output
          });
        } catch (error) {
          reply({
            type: "EXECUTE_RESULT",
            requestId,
            ok: false,
            error: error && error.message ? error.message : String(error)
          });
        }
      });
    </script>
  </body>
</html>
`;

export function useUserCodeRunner() {
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const pendingRef = useRef(
    new Map<
      string,
      {
        resolve: (value: unknown) => void;
        reject: (error: Error) => void;
      }
    >(),
  );

  const runnerSrc = useMemo(() => {
    return "data:text/html;charset=utf-8," + encodeURIComponent(RUNNER_HTML);
  }, []);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const msg = event.data;
      if (!msg || typeof msg !== "object") return;
      if (msg.type !== "EXECUTE_RESULT") return;

      const pending = pendingRef.current.get(msg.requestId);
      if (!pending) return;

      pendingRef.current.delete(msg.requestId);

      if (msg.ok) {
        pending.resolve(msg.output);
      } else {
        pending.reject(new Error(msg.error || "Execution failed"));
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  function runUserCode({
    code,
    input,
    timeoutMs = 3000,
  }: {
    code: string;
    input: unknown;
    timeoutMs?: number;
  }) {
    return new Promise((resolve, reject) => {
      const iframeWindow = iframeRef.current?.contentWindow;
      if (!iframeWindow) {
        reject(new Error("Runner iframe is not ready"));
        return;
      }

      const requestId = crypto.randomUUID();

      const timeoutId = window.setTimeout(() => {
        pendingRef.current.delete(requestId);
        reject(new Error("Execution timed out"));
      }, timeoutMs);

      pendingRef.current.set(requestId, {
        resolve: (value) => {
          clearTimeout(timeoutId);
          resolve(value);
        },
        reject: (err) => {
          clearTimeout(timeoutId);
          reject(err);
        },
      });

      iframeWindow.postMessage(
        {
          type: "EXECUTE",
          requestId,
          code,
          input,
        },
        "*",
      );
    });
  }

  const RunnerFrame = (
    <iframe
      ref={iframeRef}
      title="user-code-runner"
      src={runnerSrc}
      sandbox="allow-scripts"
      style={{ display: "none" }}
    />
  );

  return { runUserCode, RunnerFrame };
}
