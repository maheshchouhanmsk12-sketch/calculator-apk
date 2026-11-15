/**
 * ExamCalc — Modern Student Calculator & Direct Answers
 * Vanilla JavaScript Implementation
 * 
 * Safety: Absolutely NO eval() or Function() constructor used.
 * Features:
 *  - Safe Lexer & Recursive Descent Parser for BODMAS calculations
 *  - Exam operations: Powers (x²), Square Root (√), Cube Root (∛), Percentage (P% of N)
 *  - Direct answer calculation with real-time live preview
 *  - Persistent calculation history with quick copy and recall
 *  - 100% Offline, clean and fast
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const expressionDisplay = document.getElementById('expressionDisplay');
  const resultDisplay = document.getElementById('resultDisplay');
  const resultRow = document.querySelector('.result-row');
  const statusMessage = document.getElementById('statusMessage');
  const copyResultBtn = document.getElementById('copyResultBtn');
  
  // History Elements
  const mainLayout = document.getElementById('mainLayout');
  const btnToggleHistory = document.getElementById('btnToggleHistory');
  const historyBadge = document.getElementById('historyBadge');
  const historyList = document.getElementById('historyList');
  const btnClearHistory = document.getElementById('btnClearHistory');

  // --- State ---
  let expression = '';
  let lastNumericResult = null;
  let hasEvaluated = false;
  let history = [];
  let isHistoryOpen = true;

  // --- History Management ---
  function loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem('examcalc_history');
      if (stored) {
        history = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse history from localStorage', e);
      history = [];
    }

    try {
      const storedToggle = localStorage.getItem('examcalc_history_open');
      if (storedToggle !== null) {
        isHistoryOpen = storedToggle === 'true';
      }
    } catch (e) {}

    updateHistoryToggleUI();
    renderHistoryUI();
  }

  function saveHistoryToStorage() {
    try {
      localStorage.setItem('examcalc_history', JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }

  function formatTimeAgo(timestamp) {
    const diff = Date.now() - timestamp;
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function renderHistoryUI() {
    historyBadge.textContent = history.length;

    if (history.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <div class="history-empty-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h4>No history yet</h4>
          <p>Any calculation you solve with direct answers will appear here.</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = history.map((item, index) => `
      <div class="history-item" data-index="${index}" title="Click to recall this calculation">
        <div class="history-item-top">
          <span class="history-expr">${escapeHtml(item.expression)}</span>
          <span class="history-time">${formatTimeAgo(item.timestamp)}</span>
        </div>
        <div class="history-item-bottom">
          <span class="history-result">= ${item.result}</span>
          <div class="history-actions">
            <button class="history-action-btn copy-btn" data-copy="${item.result}" title="Copy result">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="history-action-btn delete-btn" data-delete="${index}" title="Delete item">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Attach event listeners for history item elements
    historyList.querySelectorAll('.history-item').forEach(itemEl => {
      itemEl.addEventListener('click', (e) => {
        // If clicking copy or delete button inside, don't trigger recall
        if (e.target.closest('.history-action-btn')) return;

        const idx = parseInt(itemEl.dataset.index, 10);
        const item = history[idx];
        if (item) {
          expression = item.expression;
          hasEvaluated = false;
          updateDisplay();
          calculate(false); // Evaluate direct answer without creating duplicate history
        }
      });
    });

    historyList.querySelectorAll('.copy-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const text = btn.dataset.copy;
        copyTextToClipboard(text, btn);
      });
    });

    historyList.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.dataset.delete, 10);
        history.splice(idx, 1);
        saveHistoryToStorage();
        renderHistoryUI();
      });
    });
  }

  function addHistoryItem(expr, result) {
    // Avoid immediate consecutive duplicate
    if (history.length > 0 && history[0].expression === expr && history[0].result === result) {
      return;
    }
    history.unshift({
      id: Date.now() + Math.random().toString(36).substring(2, 7),
      expression: expr,
      result: result,
      timestamp: Date.now()
    });
    saveHistoryToStorage();
    renderHistoryUI();
  }

  function updateHistoryToggleUI() {
    if (isHistoryOpen) {
      mainLayout.classList.add('has-history');
      btnToggleHistory.classList.add('active');
      btnToggleHistory.setAttribute('aria-expanded', 'true');
    } else {
      mainLayout.classList.remove('has-history');
      btnToggleHistory.classList.remove('active');
      btnToggleHistory.setAttribute('aria-expanded', 'false');
    }
  }

  btnToggleHistory.addEventListener('click', () => {
    isHistoryOpen = !isHistoryOpen;
    localStorage.setItem('examcalc_history_open', String(isHistoryOpen));
    updateHistoryToggleUI();
  });

  btnClearHistory.addEventListener('click', () => {
    if (history.length === 0) return;
    history = [];
    saveHistoryToStorage();
    renderHistoryUI();
  });

  // --- Display Updates & Live Answer Preview ---
  function updateDisplay() {
    expressionDisplay.textContent = expression || '';

    if (!expression) {
      resultDisplay.textContent = '0';
      resultDisplay.classList.remove('has-error', 'is-calculating');
      resultRow.classList.remove('has-direct-result');
      statusMessage.textContent = 'Ready';
      statusMessage.className = 'status-message';
      return;
    }

    if (!hasEvaluated) {
      statusMessage.textContent = 'Typing...';
      statusMessage.className = 'status-message';

      // Try computing live direct preview without throwing error
      const preview = tryComputePreview(expression);
      if (preview !== null && !isNaN(preview)) {
        resultDisplay.textContent = preview;
        resultDisplay.classList.remove('has-error');
        resultRow.classList.add('has-direct-result');
      } else {
        resultRow.classList.remove('has-direct-result');
      }
    }
  }

  // --- Calculator Input Handlers ---
  function appendValue(val) {
    if (hasEvaluated) {
      // If user starts typing a number after evaluation, start fresh
      if (/^[0-9.]/.test(val.trim())) {
        expression = '';
      }
      hasEvaluated = false;
      resultDisplay.classList.remove('has-error');
    }
    expression += val;
    updateDisplay();
  }

  function handleBackspace() {
    if (hasEvaluated) {
      expression = '';
      hasEvaluated = false;
      resultDisplay.textContent = '0';
      resultDisplay.classList.remove('has-error');
      updateDisplay();
      return;
    }

    if (!expression) return;

    // Multi-char tokens
    const multiPatterns = [
      /\s% of\s$/,
      /\s[÷×+\-]\s$/,
      /∛\($/,
      /√\($/
    ];

    let removed = false;
    for (const pattern of multiPatterns) {
      if (pattern.test(expression)) {
        expression = expression.replace(pattern, '');
        removed = true;
        break;
      }
    }

    if (!removed) {
      expression = expression.slice(0, -1);
    }

    updateDisplay();
  }

  function handleClear() {
    expression = '';
    lastNumericResult = null;
    hasEvaluated = false;
    resultDisplay.textContent = '0';
    resultDisplay.classList.remove('has-error', 'is-calculating');
    resultRow.classList.remove('has-direct-result');
    statusMessage.textContent = 'Cleared';
    statusMessage.className = 'status-message';
    updateDisplay();
  }

  function handleSquare() {
    if (hasEvaluated && lastNumericResult !== null && !isNaN(lastNumericResult)) {
      expression = `${lastNumericResult}²`;
      hasEvaluated = false;
      updateDisplay();
      calculate(true);
      return;
    }
    if (!expression) return;
    expression += '²';
    hasEvaluated = false;
    updateDisplay();
  }

  function handleSqrt() {
    if (hasEvaluated && lastNumericResult !== null && !isNaN(lastNumericResult)) {
      expression = `√(${lastNumericResult})`;
      hasEvaluated = false;
      updateDisplay();
      calculate(true);
      return;
    }
    appendValue('√(');
  }

  function handleCbrt() {
    if (hasEvaluated && lastNumericResult !== null && !isNaN(lastNumericResult)) {
      expression = `∛(${lastNumericResult})`;
      hasEvaluated = false;
      updateDisplay();
      calculate(true);
      return;
    }
    appendValue('∛(');
  }

  function handlePercent() {
    if (hasEvaluated && lastNumericResult !== null && !isNaN(lastNumericResult)) {
      expression = `${lastNumericResult}% of `;
      hasEvaluated = false;
      updateDisplay();
      return;
    }
    appendValue('% of ');
  }

  // --- Precision Sanitize ---
  function sanitizePrecision(num) {
    if (!Number.isFinite(num)) return num;
    const rounded = parseFloat(num.toPrecision(12));
    return Object.is(rounded, -0) ? 0 : rounded;
  }

  // --- Core Math Parser (No eval!) ---
  function evaluateMathExpression(rawExpr) {
    if (!rawExpr || !rawExpr.trim()) {
      return { error: 'Please enter an expression to calculate.' };
    }

    const clean = rawExpr.trim();

    // 1. Percentage pattern: "P% of N" or "P% * N"
    const percentOfMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*%\s*(?:of|\*|\×)\s*([+-]?\d+(?:\.\d+)?)$/i);
    if (percentOfMatch) {
      const p = parseFloat(percentOfMatch[1]);
      const n = parseFloat(percentOfMatch[2]);
      const decimalVal = sanitizePrecision(p / 100);
      const answer = sanitizePrecision(decimalVal * n);
      return { numeric: answer };
    }

    // Single number with %: "25%"
    const singlePercentMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*%$/);
    if (singlePercentMatch) {
      const p = parseFloat(singlePercentMatch[1]);
      const answer = sanitizePrecision(p / 100);
      return { numeric: answer };
    }

    // 2. Square: "9²" or "(-9)²" or "(9)²"
    const squareMatch = clean.match(/^([+-]?\d+(?:\.\d+)?|\([+-]?\d+(?:\.\d+)?\))\s*²$/);
    if (squareMatch) {
      const inner = squareMatch[1].replace(/[()]/g, '');
      const val = parseFloat(inner);
      const answer = sanitizePrecision(val * val);
      return { numeric: answer };
    }

    // 3. Square Root: "√81" or "√(81)"
    const sqrtMatch = clean.match(/^√\s*\(?\s*([+-]?\d+(?:\.\d+)?)\s*\)?$/);
    if (sqrtMatch) {
      const val = parseFloat(sqrtMatch[1]);
      if (val < 0) {
        return { error: 'Square root of negative number is undefined.' };
      }
      const answer = sanitizePrecision(Math.sqrt(val));
      return { numeric: answer };
    }

    // 4. Cube Root: "∛27" or "∛(27)" or "∛-8"
    const cbrtMatch = clean.match(/^∛\s*\(?\s*([+-]?\d+(?:\.\d+)?)\s*\)?$/);
    if (cbrtMatch) {
      const val = parseFloat(cbrtMatch[1]);
      const answer = sanitizePrecision(Math.cbrt(val));
      return { numeric: answer };
    }

    // 5. Simple Binary: "5 + 6", "10 ÷ 0", "8 × 9", "15 - 4"
    const binaryMatch = clean.match(/^([+-]?\d+(?:\.\d+)?)\s*([+−\-×÷*\/])\s*([+-]?\d+(?:\.\d+)?)$/);
    if (binaryMatch) {
      const a = parseFloat(binaryMatch[1]);
      const opRaw = binaryMatch[2];
      const b = parseFloat(binaryMatch[3]);

      let op = opRaw;
      if (opRaw === '×') op = '*';
      if (opRaw === '÷') op = '/';
      if (opRaw === '−') op = '-';

      if (op === '/' && b === 0) {
        return { error: 'Cannot divide by zero' };
      }

      let answer;
      if (op === '+') answer = a + b;
      else if (op === '-') answer = a - b;
      else if (op === '*') answer = a * b;
      else if (op === '/') answer = a / b;

      return { numeric: sanitizePrecision(answer) };
    }

    // 6. General BODMAS Recursive Descent Parser
    return parseAndEvaluateGeneral(clean);
  }

  function parseAndEvaluateGeneral(raw) {
    try {
      let norm = raw
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/−/g, '-')
        .replace(/²/g, '^2');

      // Replace % of with * (p/100)
      norm = norm.replace(/(\d+(?:\.\d+)?)\s*%\s*(?:of|\*)/g, '($1/100)*');
      norm = norm.replace(/(\d+(?:\.\d+)?)\s*%/g, '($1/100)');

      // Replace √ and ∛
      norm = norm.replace(/√\s*\(([^)]+)\)/g, 'sqrt($1)');
      norm = norm.replace(/√\s*(\d+(?:\.\d+)?)/g, 'sqrt($1)');
      norm = norm.replace(/∛\s*\(([^)]+)\)/g, 'cbrt($1)');
      norm = norm.replace(/∛\s*(\d+(?:\.\d+)?)/g, 'cbrt($1)');

      // Lexer
      const tokens = [];
      let i = 0;
      while (i < norm.length) {
        const ch = norm[i];
        if (/\s/.test(ch)) {
          i++;
          continue;
        }

        if (/[0-9.]/.test(ch)) {
          let numStr = '';
          while (i < norm.length && /[0-9.]/.test(norm[i])) {
            numStr += norm[i];
            i++;
          }
          if ((numStr.match(/\./g) || []).length > 1) {
            return { error: `Invalid decimal format.` };
          }
          tokens.push({ type: 'NUMBER', value: parseFloat(numStr) });
          continue;
        }

        if (ch === 's' && norm.substr(i, 4) === 'sqrt') {
          tokens.push({ type: 'FUNC', value: 'sqrt' });
          i += 4;
          continue;
        }

        if (ch === 'c' && norm.substr(i, 4) === 'cbrt') {
          tokens.push({ type: 'FUNC', value: 'cbrt' });
          i += 4;
          continue;
        }

        if ('+-*/^()'.includes(ch)) {
          tokens.push({ type: ch, value: ch });
          i++;
          continue;
        }

        return { error: `Invalid symbol: "${ch}"` };
      }

      if (tokens.length === 0) {
        return { error: 'Empty expression.' };
      }

      // Parser
      let pos = 0;

      function peek() {
        return tokens[pos];
      }

      function consume(expectedType) {
        const token = tokens[pos];
        if (!token) throw new Error('Unexpected end of expression.');
        if (expectedType && token.type !== expectedType) {
          throw new Error(`Expected "${expectedType}"`);
        }
        pos++;
        return token;
      }

      function parseExpression() {
        let left = parseTerm();
        while (peek() && (peek().type === '+' || peek().type === '-')) {
          const op = consume().type;
          const right = parseTerm();
          if (op === '+') {
            left = sanitizePrecision(left + right);
          } else {
            left = sanitizePrecision(left - right);
          }
        }
        return left;
      }

      function parseTerm() {
        let left = parsePower();
        while (peek() && (peek().type === '*' || peek().type === '/')) {
          const op = consume().type;
          const right = parsePower();
          if (op === '*') {
            left = sanitizePrecision(left * right);
          } else {
            if (right === 0) {
              throw new Error('DIVISION_BY_ZERO');
            }
            left = sanitizePrecision(left / right);
          }
        }
        return left;
      }

      function parsePower() {
        let left = parseFactor();
        while (peek() && peek().type === '^') {
          consume('^');
          const exponent = parseFactor();
          left = sanitizePrecision(Math.pow(left, exponent));
        }
        return left;
      }

      function parseFactor() {
        const token = peek();
        if (!token) throw new Error('Incomplete expression.');

        if (token.type === '-') {
          consume('-');
          const val = parseFactor();
          return -val;
        }
        if (token.type === '+') {
          consume('+');
          return parseFactor();
        }

        if (token.type === 'FUNC') {
          const fn = consume().value;
          consume('(');
          const inner = parseExpression();
          consume(')');
          if (fn === 'sqrt') {
            if (inner < 0) throw new Error('NEGATIVE_SQRT');
            return sanitizePrecision(Math.sqrt(inner));
          } else if (fn === 'cbrt') {
            return sanitizePrecision(Math.cbrt(inner));
          }
        }

        if (token.type === '(') {
          consume('(');
          const val = parseExpression();
          consume(')');
          return val;
        }

        if (token.type === 'NUMBER') {
          consume('NUMBER');
          return token.value;
        }

        throw new Error(`Unexpected token: ${token.value}`);
      }

      const answer = parseExpression();

      if (pos < tokens.length) {
        throw new Error('Invalid syntax.');
      }

      return { numeric: answer };

    } catch (err) {
      if (err.message === 'DIVISION_BY_ZERO') {
        return { error: 'Cannot divide by zero' };
      }
      if (err.message === 'NEGATIVE_SQRT') {
        return { error: 'Square root of negative number is undefined.' };
      }
      return { error: err.message || 'Invalid expression.' };
    }
  }

  // Safe helper to preview direct answer while user is typing
  function tryComputePreview(expr) {
    if (!expr || !expr.trim()) return null;
    const clean = expr.trim();
    // Don't attempt preview on dangling operators
    if (/[\+\-\×\÷\*\/\(\^]$/.test(clean)) return null;
    if (/\s% of\s*$/.test(clean)) return null;

    try {
      const res = evaluateMathExpression(clean);
      if (res && res.numeric !== undefined && !res.error) {
        return res.numeric;
      }
    } catch (e) {}
    return null;
  }

  // --- Calculation Trigger (Direct Answer) ---
  function calculate(saveToHistory = true) {
    if (!expression || !expression.trim()) return;

    const currentExpr = expression;
    const evalResult = evaluateMathExpression(currentExpr);
    hasEvaluated = true;

    if (evalResult.error) {
      resultDisplay.textContent = evalResult.error;
      resultDisplay.classList.add('has-error');
      resultDisplay.classList.remove('is-calculating');
      resultRow.classList.remove('has-direct-result');
      statusMessage.textContent = 'Error';
      statusMessage.className = 'status-message error';
    } else {
      const finalVal = evalResult.numeric;
      lastNumericResult = finalVal;
      resultDisplay.textContent = finalVal;
      resultDisplay.classList.remove('has-error');
      resultRow.classList.add('has-direct-result');
      statusMessage.textContent = 'Calculated';
      statusMessage.className = 'status-message success';

      // Visual punch effect for direct answer
      resultDisplay.classList.add('is-calculating');
      setTimeout(() => {
        resultDisplay.classList.remove('is-calculating');
      }, 180);

      // Save to calculation history
      if (saveToHistory) {
        addHistoryItem(currentExpr, finalVal);
      }
    }
  }

  // --- Button Click Delegation ---
  document.querySelectorAll('.calc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const value = btn.dataset.value;

      switch (action) {
        case 'insert':
          appendValue(value);
          break;
        case 'clear':
          handleClear();
          break;
        case 'backspace':
          handleBackspace();
          break;
        case 'square':
          handleSquare();
          break;
        case 'sqrt':
          handleSqrt();
          break;
        case 'cbrt':
          handleCbrt();
          break;
        case 'percent':
          handlePercent();
          break;
        case 'calculate':
          calculate(true);
          break;
      }
    });
  });

  // --- Quick Preset Chips Delegation ---
  document.querySelectorAll('.chip-btn').forEach(chip => {
    chip.addEventListener('click', () => {
      expression = chip.dataset.preset;
      hasEvaluated = false;
      updateDisplay();
      calculate(true);
    });
  });

  // --- Copy Direct Answer Helper ---
  function copyTextToClipboard(text, btnElement) {
    if (!text || text === '0' || text.includes('Cannot') || text.includes('Invalid')) {
      return;
    }

    navigator.clipboard.writeText(String(text)).then(() => {
      const originalHtml = btnElement.innerHTML;
      btnElement.classList.add('copied');
      btnElement.innerHTML = `
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>Copied!</span>
      `;
      setTimeout(() => {
        btnElement.classList.remove('copied');
        btnElement.innerHTML = originalHtml;
      }, 1500);
    }).catch(err => {
      console.warn('Clipboard write error', err);
    });
  }

  copyResultBtn.addEventListener('click', () => {
    const textToCopy = resultDisplay.textContent;
    copyTextToClipboard(textToCopy, copyResultBtn);
  });

  // --- Physical Keyboard Support ---
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

    if (e.key >= '0' && e.key <= '9') {
      appendValue(e.key);
      e.preventDefault();
    } else if (e.key === '.') {
      appendValue('.');
      e.preventDefault();
    } else if (e.key === '+') {
      appendValue(' + ');
      e.preventDefault();
    } else if (e.key === '-') {
      appendValue(' - ');
      e.preventDefault();
    } else if (e.key === '*') {
      appendValue(' × ');
      e.preventDefault();
    } else if (e.key === '/') {
      appendValue(' ÷ ');
      e.preventDefault();
    } else if (e.key === '(' || e.key === ')') {
      appendValue(e.key);
      e.preventDefault();
    } else if (e.key === '%') {
      handlePercent();
      e.preventDefault();
    } else if (e.key === 'Enter' || e.key === '=') {
      calculate(true);
      e.preventDefault();
    } else if (e.key === 'Backspace') {
      handleBackspace();
      e.preventDefault();
    } else if (e.key === 'Escape') {
      handleClear();
      e.preventDefault();
    } else if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
      isHistoryOpen = !isHistoryOpen;
      updateHistoryToggleUI();
      e.preventDefault();
    }
  });

  function escapeHtml(str) {
    if (typeof str !== 'string') return String(str);
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // --- Initial Launch ---
  loadHistoryFromStorage();
  updateDisplay();
});
