class Calculator {
  constructor(previousOperandElement, currentOperandElement) {
    this.previousOperandElement = previousOperandElement;
    this.currentOperandElement = currentOperandElement;
    this.clear();
  }

  clear() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.updateDisplay();
  }

  delete() {
    if (this.shouldResetScreen) {
      this.clear();
      return;
    }
    if (this.currentOperand === '0' || this.currentOperand === 'Error') return;

    if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
    this.updateDisplay();
  }

  appendNumber(number) {
    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    if (number === '.' && this.currentOperand.includes('.')) return;
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number.toString();
    } else {
      // Limit to 15 digits to avoid display overflow
      if (this.currentOperand.replace(/[^0-9]/g, '').length >= 15 && number !== '.') return;
      this.currentOperand = this.currentOperand.toString() + number.toString();
    }
    this.updateDisplay();
  }

  chooseOperation(operation) {
    if (this.currentOperand === 'Error') return;

    if (this.previousOperand !== '' && !this.shouldResetScreen) {
      this.compute();
    }

    this.operation = operation;
    this.previousOperand = this.currentOperand;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  compute() {
    let computation;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    switch (this.operation) {
      case '+':
        computation = prev + current;
        break;
      case '-':
        computation = prev - current;
        break;
      case '×':
      case '*':
        computation = prev * current;
        break;
      case '÷':
      case '/':
        if (current === 0) {
          this.currentOperand = 'Error';
          this.previousOperand = '';
          this.operation = undefined;
          this.shouldResetScreen = true;
          this.updateDisplay();
          return;
        }
        computation = prev / current;
        break;
      default:
        return;
    }

    // Fix floating point precision (e.g., 0.1 + 0.2 = 0.30000000000000004)
    computation = Math.round((computation + Number.EPSILON) * 1e12) / 1e12;

    this.currentOperand = computation.toString();
    this.previousOperand = `${prev} ${this.operation} ${current} =`;
    this.operation = undefined;
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  percent() {
    if (this.currentOperand === 'Error') return;
    const current = parseFloat(this.currentOperand);
    if (isNaN(current)) return;

    const result = current / 100;
    this.currentOperand = (Math.round((result + Number.EPSILON) * 1e12) / 1e12).toString();
    this.updateDisplay();
  }

  negate() {
    if (this.currentOperand === 'Error' || this.currentOperand === '0') return;
    if (this.currentOperand.startsWith('-')) {
      this.currentOperand = this.currentOperand.slice(1);
    } else {
      this.currentOperand = '-' + this.currentOperand;
    }
    this.updateDisplay();
  }

  formatDisplayNumber(numberStr) {
    if (numberStr === 'Error' || numberStr === '') return numberStr;

    const stringNumber = numberStr.toString();
    const isNegative = stringNumber.startsWith('-');
    const cleanNumber = isNegative ? stringNumber.slice(1) : stringNumber;
    const integerDigits = parseFloat(cleanNumber.split('.')[0]);
    const decimalDigits = cleanNumber.split('.')[1];

    let integerDisplay;
    if (isNaN(integerDigits)) {
      integerDisplay = '0';
    } else {
      integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
    }

    const sign = isNegative ? '-' : '';

    if (decimalDigits != null) {
      return `${sign}${integerDisplay}.${decimalDigits}`;
    } else {
      return `${sign}${integerDisplay}`;
    }
  }

  updateDisplay() {
    this.currentOperandElement.innerText = this.formatDisplayNumber(this.currentOperand);

    // Adjust font size dynamically if the number is very long
    const length = this.currentOperand.length;
    if (length > 13) {
      this.currentOperandElement.style.fontSize = '1.35rem';
    } else if (length > 9) {
      this.currentOperandElement.style.fontSize = '1.75rem';
    } else {
      this.currentOperandElement.style.fontSize = '';
    }

    if (this.operation != null) {
      this.previousOperandElement.innerText = `${this.formatDisplayNumber(this.previousOperand)} ${this.operation}`;
    } else {
      this.previousOperandElement.innerText = this.previousOperand;
    }
  }
}

// DOM Elements
const previousOperandElement = document.getElementById('previousOperand');
const currentOperandElement = document.getElementById('currentOperand');
const calculator = new Calculator(previousOperandElement, currentOperandElement);

// Event Listeners for Number Buttons
document.querySelectorAll('[data-number]').forEach(button => {
  button.addEventListener('click', () => {
    calculator.appendNumber(button.getAttribute('data-number'));
  });
});

// Event Listeners for Operator Buttons
document.querySelectorAll('[data-operator]').forEach(button => {
  button.addEventListener('click', () => {
    calculator.chooseOperation(button.getAttribute('data-operator'));
  });
});

// Event Listeners for Actions
document.querySelectorAll('[data-action]').forEach(button => {
  button.addEventListener('click', () => {
    const action = button.getAttribute('data-action');
    switch (action) {
      case 'clear':
        calculator.clear();
        break;
      case 'delete':
        calculator.delete();
        break;
      case 'equals':
        calculator.compute();
        break;
      case 'percent':
        calculator.percent();
        break;
      case 'negate':
        calculator.negate();
        break;
      case 'decimal':
        calculator.appendNumber('.');
        break;
    }
  });
});

// Keyboard Support
const keyMap = {
  '0': () => calculator.appendNumber('0'),
  '1': () => calculator.appendNumber('1'),
  '2': () => calculator.appendNumber('2'),
  '3': () => calculator.appendNumber('3'),
  '4': () => calculator.appendNumber('4'),
  '5': () => calculator.appendNumber('5'),
  '6': () => calculator.appendNumber('6'),
  '7': () => calculator.appendNumber('7'),
  '8': () => calculator.appendNumber('8'),
  '9': () => calculator.appendNumber('9'),
  '.': () => calculator.appendNumber('.'),
  ',': () => calculator.appendNumber('.'),
  '+': () => calculator.chooseOperation('+'),
  '-': () => calculator.chooseOperation('-'),
  '*': () => calculator.chooseOperation('×'),
  '/': () => calculator.chooseOperation('÷'),
  '%': () => calculator.percent(),
  'Enter': () => calculator.compute(),
  '=': () => calculator.compute(),
  'Backspace': () => calculator.delete(),
  'Escape': () => calculator.clear(),
  'c': () => calculator.clear(),
  'C': () => calculator.clear()
};

function highlightButton(selector) {
  const el = document.querySelector(selector);
  if (el) {
    el.classList.add('active-key');
    setTimeout(() => el.classList.remove('active-key'), 120);
  }
}

window.addEventListener('keydown', (e) => {
  if (keyMap[e.key]) {
    e.preventDefault();
    keyMap[e.key]();

    // Visual button feedback
    if (!isNaN(e.key)) {
      highlightButton(`[data-number="${e.key}"]`);
    } else if (e.key === '+') {
      highlightButton('[data-operator="+"]');
    } else if (e.key === '-') {
      highlightButton('[data-operator="-"]');
    } else if (e.key === '*') {
      highlightButton('[data-operator="×"]');
    } else if (e.key === '/') {
      highlightButton('[data-operator="÷"]');
    } else if (e.key === 'Enter' || e.key === '=') {
      highlightButton('[data-action="equals"]');
    } else if (e.key === 'Backspace') {
      highlightButton('[data-action="delete"]');
    } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
      highlightButton('[data-action="clear"]');
    } else if (e.key === '.' || e.key === ',') {
      highlightButton('[data-action="decimal"]');
    } else if (e.key === '%') {
      highlightButton('[data-action="percent"]');
    }
  }
});

// Theme Management
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');

function setTheme(theme) {
  if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    themeIcon.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;
    localStorage.setItem('theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeIcon.innerHTML = `
      <circle cx="12" cy="12" r="5"></circle>
      <line x1="12" y1="1" x2="12" y2="3"></line>
      <line x1="12" y1="21" x2="12" y2="23"></line>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
      <line x1="1" y1="12" x2="3" y2="12"></line>
      <line x1="21" y1="12" x2="23" y2="12"></line>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
    `;
    localStorage.setItem('theme', 'dark');
  }
}

// Initial theme setup
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  setTheme(savedTheme);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
  setTheme('light');
}

themeToggle.addEventListener('click', () => {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  setTheme(currentTheme === 'light' ? 'dark' : 'light');
});
