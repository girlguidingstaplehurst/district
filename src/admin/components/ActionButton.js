import RoundedButton from "../../components/RoundedButton";
import { useRevalidator } from "react-router-dom";
import { useState } from "react";

function ActionButton({ children, action, ...rest }) {
  const revalidator = useRevalidator();
  const [loading, setLoading] = useState(false);

  return (
    <RoundedButton
      isLoading={loading}
      onClick={async () => {
        setLoading(true);
        await action();
        revalidator.revalidate();
        setLoading(false);
      }}
      {...rest}
    >
      {children}
    </RoundedButton>
  );
}

export default ActionButton;
