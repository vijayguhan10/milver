  // eslint-disable-next-line react/prop-types
function RouteImg({ route_id, colors }) {
  // eslint-disable-next-line react/prop-types
  const color = colors[(route_id ) % colors.length];
  return (
    <svg
      width="30"
      height="15"
      viewBox="0 0 61 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <line
        x1="6.54346"
        y1="5.5"
        x2="54.5435"
        y2="5.5"
        stroke={color}
        strokeWidth="5"
      />
      <circle cx="55.0435" cy="5.5" r="5" fill={color} stroke={color} />
      <circle cx="6.04346" cy="5.5" r="5" fill={color} stroke={color} />
    </svg>
  );
}

export default RouteImg;
