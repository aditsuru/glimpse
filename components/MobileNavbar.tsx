import {
	Home01Icon,
	PlusSignCircleIcon,
	Settings01Icon,
	UserIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

function MobileNavbar() {
	return (
		<div className="lg:hidden fixed right-0 left-0 bottom-0 w-full bg-background flex justify-between items-center p-4 px-8 border-t-4 border-foreground z-50">
			<HugeiconsIcon icon={Home01Icon} size={32} />

			<HugeiconsIcon icon={PlusSignCircleIcon} size={32} />

			<HugeiconsIcon icon={UserIcon} size={32} />

			<HugeiconsIcon icon={Settings01Icon} size={32} />
		</div>
	);
}

export default MobileNavbar;
