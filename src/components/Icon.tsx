const paths = {
  // From the asset pack's icons/ folder (24px grid, stroked, currentColor).
  basket: 'M3 9h18l-2 11H5zM7 9l4-6M17 9l-4-6M9 13v3M15 13v3',
  branch: 'M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  care: 'M12 21S2 15 2 8a5 5 0 0 1 10-1 5 5 0 0 1 10 1c0 7-10 13-10 13',
  chat: 'M3 4h18v13H9l-6 4zM7 8h10M7 12h6',
  check: 'M4 12l5 5L20 6',
  clock: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 6v6l4 2',
  collection: 'M4 8h16v13H4zM3 8l2-5h14l2 5M9 21v-7h6v7',
  delivery: 'M3 5h11v12H3zM14 10h4l3 4v3h-7M5 17a2 2 0 1 0 4 0M15 17a2 2 0 1 0 4 0',
  document: 'M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h6',
  phone: 'M7 3H3c0 10 8 18 18 18v-4l-5-2-3 3-7-7 3-3z',
  plus: 'M12 4v16M4 12h16',
  search: 'M16 10a6 6 0 1 1-12 0 6 6 0 0 1 12 0M15 15l6 6',
  // Interface glyphs drawn to the same grid.
  minus: 'M4 12h16',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  back: 'M19 12H5m5-5-5 5 5 5',
  edit: 'M4 20h4L19 9l-4-4L4 16v4Z',
  menu: 'M4 7h16M4 12h16M4 17h16',
  close: 'M6 6l12 12M18 6 6 18',
  print: 'M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z',
  trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3',
  info: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M12 11v6M12 7.5v.5',
} as const

export type IconName = keyof typeof paths

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d={paths[name]} />
    </svg>
  )
}
