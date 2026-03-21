import AvailabilityTypeStep, { type AvailabilitySubType } from "./AvailabilityTypeStep";
import CalendarStep from "./CalendarStep";

interface AvailabilityStepProps {
  availabilitySubType: AvailabilitySubType;
  blockedDates: Date[];
  onChangeAvailabilitySubType: (s: AvailabilitySubType) => void;
  onChangeBlockedDates: (d: Date[]) => void;
}

const AvailabilityStep = ({
  availabilitySubType, blockedDates,
  onChangeAvailabilitySubType, onChangeBlockedDates,
}: AvailabilityStepProps) => {
  return (
    <div className="space-y-6">
      <AvailabilityTypeStep
        availabilitySubType={availabilitySubType}
        onChangeSubType={onChangeAvailabilitySubType}
      />

      {availabilitySubType === "calendar" && (
        <CalendarStep
          blockedDates={blockedDates}
          onChangeBlockedDates={onChangeBlockedDates}
        />
      )}
    </div>
  );
};

export default AvailabilityStep;
