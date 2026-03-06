import {
	Home01Icon,
	PlusSignCircleIcon,
	Settings01Icon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function MobileNavbar() {
	return (
		<>
			<HugeiconsIcon icon={Home01Icon} size={32} />

			<HugeiconsIcon icon={PlusSignCircleIcon} size={32} />

			<HugeiconsIcon icon={UserIcon} size={32} />

			<HugeiconsIcon icon={Settings01Icon} size={32} />
		</>
	);
}

export default MobileNavbar;
