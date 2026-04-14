import { forwardRef } from "react";
import Dropdown, { type DropdownHandle } from "../components/Dropdown";

interface CityDropdownProps {
  labels: string[];
  value: string;
  disabled: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

export type CityDropdownHandle = DropdownHandle;

const CityDropdown = forwardRef<CityDropdownHandle, CityDropdownProps>(
  (props, ref) => <Dropdown ref={ref} {...props} />,
);

CityDropdown.displayName = "CityDropdown";

export default CityDropdown;
