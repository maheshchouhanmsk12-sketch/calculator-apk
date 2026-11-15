import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calculator } from './Calculator';

describe('Instant Percentage Calculator - Full Specification Suite', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('1. Initial Load: All 3 fields are completely BLANK with no default/sample values', () => {
    render(<Calculator />);

    // Exactly two editable inputs and one answer field
    const numberInput = screen.getByLabelText(/number/i) as HTMLInputElement;
    const percentageInput = screen.getByLabelText(/percentage/i) as HTMLInputElement;
    const answerInput = screen.getByLabelText(/answer/i) as HTMLInputElement;

    expect(numberInput).toBeInTheDocument();
    expect(percentageInput).toBeInTheDocument();
    expect(answerInput).toBeInTheDocument();

    // Verify completely blank initial values
    expect(numberInput.value).toBe('');
    expect(percentageInput.value).toBe('');
    expect(answerInput.value).toBe('');

    // Verify placeholders
    expect(numberInput.placeholder).toMatch(/enter number/i);
    expect(percentageInput.placeholder).toMatch(/enter percentage/i);

    // Verify answer is read-only
    expect(answerInput).toHaveAttribute('readonly');

    // Confirm NO "Calculate" button exists
    expect(screen.queryByRole('button', { name: /calculate/i })).not.toBeInTheDocument();

    // Confirm Copy button is NOT visible when answer is blank
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('2. Real-time Calculation: Updates instantly on typing without calculate button', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const numberInput = screen.getByLabelText(/number/i) as HTMLInputElement;
    const percentageInput = screen.getByLabelText(/percentage/i) as HTMLInputElement;
    const answerInput = screen.getByLabelText(/answer/i) as HTMLInputElement;

    // Type 100 into Number
    await user.type(numberInput, '100');
    // Answer must still be blank because Percentage is not entered yet
    expect(answerInput.value).toBe('');

    // Type 50 into Percentage
    await user.type(percentageInput, '50');
    // Answer must immediately display 50 (100 * 50 / 100 = 50)
    expect(answerInput.value).toBe('50');

    // Copy button must now be visible
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
  });

  it('3. Mathematical Test Cases from Specification', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const numberInput = screen.getByLabelText(/number/i) as HTMLInputElement;
    const percentageInput = screen.getByLabelText(/percentage/i) as HTMLInputElement;
    const answerInput = screen.getByLabelText(/answer/i) as HTMLInputElement;

    const cases = [
      { num: '500', pct: '20', expected: '100' },
      { num: '2500', pct: '10', expected: '250' },
      { num: '1000', pct: '75', expected: '750' },
      { num: '200', pct: '150', expected: '300' },
      { num: '99', pct: '12.5', expected: '12.375' },
      { num: '0', pct: '50', expected: '0' },
      { num: '100', pct: '0', expected: '0' },
      { num: '-100', pct: '50', expected: '-50' },
    ];

    for (const testCase of cases) {
      await user.clear(numberInput);
      await user.type(numberInput, testCase.num);

      await user.clear(percentageInput);
      await user.type(percentageInput, testCase.pct);

      expect(answerInput.value).toBe(testCase.expected);
    }
  });

  it('4. Clear Functionality: Resets all fields to blank and hides copy action', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const numberInput = screen.getByLabelText(/number/i) as HTMLInputElement;
    const percentageInput = screen.getByLabelText(/percentage/i) as HTMLInputElement;
    const answerInput = screen.getByLabelText(/answer/i) as HTMLInputElement;
    const clearButton = screen.getByRole('button', { name: /clear/i });

    // Enter values
    await user.type(numberInput, '500');
    await user.type(percentageInput, '20');
    expect(answerInput.value).toBe('100');
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();

    // Click Clear
    await user.click(clearButton);

    // All fields must be completely blank
    expect(numberInput.value).toBe('');
    expect(percentageInput.value).toBe('');
    expect(answerInput.value).toBe('');

    // Copy button must be gone
    expect(screen.queryByRole('button', { name: /copy/i })).not.toBeInTheDocument();
  });

  it('5. Copy Functionality: Copies answer to clipboard and displays feedback', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    // Mock clipboard writeText
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: writeTextMock,
      },
      writable: true,
      configurable: true,
    });

    const numberInput = screen.getByLabelText(/number/i) as HTMLInputElement;
    const percentageInput = screen.getByLabelText(/percentage/i) as HTMLInputElement;

    await user.type(numberInput, '99');
    await user.type(percentageInput, '12.5');

    const copyBtn = screen.getByRole('button', { name: /copy/i });
    expect(copyBtn).toBeInTheDocument();

    await user.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledWith('12.375');
    // Verify subtle copied feedback text
    expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument();
  });

  it('6. Edge Cases & Validation: intermediate minus, decimals, partial entries', async () => {
    const user = userEvent.setup();
    render(<Calculator />);

    const numberInput = screen.getByLabelText(/number/i) as HTMLInputElement;
    const percentageInput = screen.getByLabelText(/percentage/i) as HTMLInputElement;
    const answerInput = screen.getByLabelText(/answer/i) as HTMLInputElement;

    // Typing only minus sign in number
    await user.type(numberInput, '-');
    await user.type(percentageInput, '50');
    // Not a complete number yet, keep answer blank (no NaN)
    expect(answerInput.value).toBe('');

    // Finish typing number
    await user.type(numberInput, '50');
    expect(answerInput.value).toBe('-25');

    // Decimal numbers
    await user.clear(numberInput);
    await user.clear(percentageInput);
    await user.type(numberInput, '0.5');
    await user.type(percentageInput, '2.5');
    expect(answerInput.value).toBe('0.0125');
  });
});
