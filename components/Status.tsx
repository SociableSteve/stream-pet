const Status = ({ name, max, current }) => {
  return (
    <div>
      <div>{name}</div>
      <div>
        {new Array(current).fill(0).map((_, i) => (
          <img key={i} src="Filled Heart.png" />
        ))}
        {new Array(max - current).fill(0).map((_, i) => (
          <img key={i} src="Empty Heart.png" />
        ))}
      </div>
    </div>
  );
};

export default Status;
