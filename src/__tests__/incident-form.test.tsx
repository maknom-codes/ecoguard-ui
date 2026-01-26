import { fireEvent, render, screen } from "@testing-library/react";
import { SignalementModal } from "../components/set-incident";

test('help user to enter a description', () => {
  render(<SignalementModal/>);

  const input = screen.getByPlaceholderText(/Describe incident/i);
  fireEvent.change(input, { target: { value: 'Fire of forest detected' } });
  expect(input).toHaveValue('Fire of forest detected');
});
