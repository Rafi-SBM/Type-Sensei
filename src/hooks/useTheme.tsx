export function useTheme() {
  // Provide a no-op hook so other components can call it safely.
  const setTheme = (_: any) => {};
  const toggle = () => {};
  const theme = 'light' as const;
  const effective = 'light' as const;
  return { theme, effective, setTheme, toggle } as const;
}
