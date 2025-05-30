import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Tooltip } from '../Tooltip';

describe('Tooltip', () => {
  it('renders children correctly', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('shows tooltip on hover', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);

    expect(screen.getByText('Test tooltip')).toBeInTheDocument();
  });

  it('hides tooltip when mouse leaves', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Hover me</button>
      </Tooltip>
    );

    const button = screen.getByText('Hover me');
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);

    expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Focus me</button>
      </Tooltip>
    );

    const button = screen.getByText('Focus me');
    fireEvent.focus(button);

    expect(screen.getByText('Test tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    render(
      <Tooltip content="Test tooltip">
        <button>Focus me</button>
      </Tooltip>
    );

    const button = screen.getByText('Focus me');
    fireEvent.focus(button);
    fireEvent.blur(button);

    expect(screen.queryByText('Test tooltip')).not.toBeInTheDocument();
  });
}); 