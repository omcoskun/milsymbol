// The line icons of studio/index.html as MUI SvgIcons.
import SvgIcon from "@mui/material/SvgIcon";

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };

export const PaletteIcon = (props) => (
  <SvgIcon {...props}>
    <g {...line}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1.5" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1.5" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1.5" />
    </g>
  </SvgIcon>
);
export const SearchIcon = (props) => (
  <SvgIcon {...props}>
    <g {...line}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </g>
  </SvgIcon>
);
export const PenIcon = (props) => (
  <SvgIcon {...props}>
    <g {...line}>
      <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </g>
  </SvgIcon>
);
export const FileIcon = (props) => (
  <SvgIcon {...props}>
    <g {...line}>
      <path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8Z" />
      <path d="M14 3v5h5M12 11v6m-3-3 3 3 3-3" />
    </g>
  </SvgIcon>
);
export const InfoIcon = (props) => (
  <SvgIcon {...props}>
    <g {...line}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v6" />
    </g>
    <circle cx="12" cy="7" r="1.2" fill="currentColor" />
  </SvgIcon>
);
export const ChevronDown = (props) => (
  <SvgIcon {...props}>
    <path d="m7 10 5 5 5-5" {...line} />
  </SvgIcon>
);
export const ChevronRight = (props) => (
  <SvgIcon {...props}>
    <path d="m6 4 4 4-4 4" {...line} transform="scale(1.5)" />
  </SvgIcon>
);
export const ClockIcon = (props) => (
  <SvgIcon {...props}>
    <g {...line}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </g>
  </SvgIcon>
);
export const BrandMark = () => (
  <svg viewBox="0 0 32 26" width="28" height="24" aria-hidden="true">
    <rect x="2" y="4" width="28" height="19" rx="1" fill="#c5e7f7" stroke="currentColor" strokeWidth="1.8" />
    <path d="m2 4 28 19M30 4 2 23" stroke="currentColor" strokeWidth="1.5" />
  </svg>
);
