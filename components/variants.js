import React from "react";

export const Variants = ({ index, groupName, onUpdate }) => {
  return (
    <TextField
      value={v}
      onChange={() => {
        v.groupName = onUpdate(i, v);
      }}
      label="Variant Group Name"
      type="text"
      helpText={
        <span>
          This is used internally to help organize variants. This will not be
          displayed to the customer.
        </span>
      }
    />
  );
};
