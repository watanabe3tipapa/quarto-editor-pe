let pyodide = null;
let pyodideLoading = false;

export const PyodideService = {
  async load() {
    if (pyodide) return pyodide;
    if (pyodideLoading) {
      while (pyodideLoading) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      return pyodide;
    }
    
    pyodideLoading = true;
    try {
      pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
      });
      return pyodide;
    } finally {
      pyodideLoading = false;
    }
  },

  async runPython(code) {
    const py = await this.load();
    
    const logs = [];
    py.runPython(`
import sys
from io import StringIO

class OutputCapture:
    def __init__(self):
        self.output = StringIO()
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
    
    def __enter__(self):
        sys.stdout = self.output
        sys.stderr = self.output
        return self
    
    def __exit__(self, *args):
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr
    
    def get_output(self):
        return self.output.getvalue()

_capture = OutputCapture()
    `);

    let result = '';
    let hasError = false;
    
    try {
      py.runPython(`
with _capture:
${code}
      `.trim());
      result = py.runPython('_capture.get_output()');
    } catch (error) {
      hasError = true;
      result = error.message;
    }

    return { output: result, hasError };
  },

  isLoaded() {
    return pyodide !== null;
  }
};

export default PyodideService;
