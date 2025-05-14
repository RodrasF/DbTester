import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import type { DatabasePermission, UserPermission } from "@/models/userTypes";

interface PermissionItemProps {
  permission: DatabasePermission;
  checked: boolean;
  objectName?: string | null;
  disabled?: boolean;
  onChange: (permission: UserPermission) => void;
  requiresObjectName?: boolean;
}

export function PermissionItem({
  permission,
  checked,
  objectName: initialObjectName = null,
  disabled = false,
  onChange,
  requiresObjectName = false,
}: PermissionItemProps) {
  const [showObjectName, setShowObjectName] = useState(
    checked && requiresObjectName
  );
  const [objectName, setObjectName] = useState<string | null>(
    initialObjectName
  );

  const handleCheckedChange = (isChecked: boolean) => {
    setShowObjectName(isChecked && requiresObjectName);

    onChange({
      permission,
      objectName: isChecked && objectName ? objectName : null,
      isGranted: isChecked,
    });
  };

  const handleObjectNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newObjectName = e.target.value;
    setObjectName(newObjectName);

    if (checked) {
      onChange({
        permission,
        objectName: newObjectName || null,
        isGranted: true,
      });
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={`permission-${permission}`}
          checked={checked}
          onCheckedChange={(isChecked) => handleCheckedChange(!!isChecked)}
          disabled={disabled}
        />
        <label
          htmlFor={`permission-${permission}`}
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          {permission}
        </label>
      </div>

      {showObjectName && (
        <div className="ml-6 mt-1">
          <Input
            placeholder="Table/Object name"
            value={objectName || ""}
            onChange={handleObjectNameChange}
            className="h-7 text-xs"
          />
        </div>
      )}
    </div>
  );
}
