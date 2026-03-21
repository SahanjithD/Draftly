import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({ posts: [] }),
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

test('renders home page content', async () => {
  render(<App />);
  expect(await screen.findByText(/ideas worth sharing\./i)).toBeInTheDocument();
});
