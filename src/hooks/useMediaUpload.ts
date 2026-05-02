import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { uploadToS3 } from "@/lib/client/upload-utils";
import {
	DEFAULT_PFP_URL,
	isVideo,
	MAX_FILE_SIZES,
} from "@/lib/shared/constants";

type UseMediaUploadOptions = {
	allowedMimeTypes: readonly string[];
	getPresignedUrl: (
		mimeType: string
	) => Promise<{ presignedUrl: string; key: string }>;
	defaultPreview?: string;
};

type UseMediaUploadReturn = {
	preview: string;
	tempKey: string | null;
	mimeType: string | null;
	isUploading: boolean;
	isVideoPreview: boolean;
	handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
	reset: () => void;
};

export const useMediaUpload = ({
	allowedMimeTypes,
	getPresignedUrl,
	defaultPreview = DEFAULT_PFP_URL,
}: UseMediaUploadOptions): UseMediaUploadReturn => {
	const [preview, setPreview] = useState<string>(defaultPreview);
	const [tempKey, setTempKey] = useState<string | null>(null);
	const [mimeType, setMimeType] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const objectUrlRef = useRef<string | null>(null);

	useEffect(() => {
		return () => {
			if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
		};
	}, []);

	useEffect(() => {
		if (!tempKey) {
			setPreview(defaultPreview);
		}
	}, [defaultPreview, tempKey]);

	const reset = () => {
		if (objectUrlRef.current) {
			URL.revokeObjectURL(objectUrlRef.current);
			objectUrlRef.current = null;
		}
		setPreview(defaultPreview);
		setTempKey(null);
		setMimeType(null);
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];

		e.target.value = "";
		if (!file) return;

		if (!(allowedMimeTypes as readonly string[]).includes(file.type)) {
			toast.error("Invalid file type");
			return;
		}

		const sizeLimit = isVideo(file.type)
			? MAX_FILE_SIZES.video
			: MAX_FILE_SIZES.image;
		const sizeLabelMB = sizeLimit / (1024 * 1024);
		if (file.size > sizeLimit) {
			toast.error(`File must be under ${sizeLabelMB}MB`);
			return;
		}

		const objectUrl = URL.createObjectURL(file);
		if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
		objectUrlRef.current = objectUrl;
		setPreview(objectUrl);

		setIsUploading(true);
		try {
			const { presignedUrl, key } = await getPresignedUrl(file.type);
			await uploadToS3(presignedUrl, file);
			setTempKey(key);
			setMimeType(file.type);
		} catch {
			toast.error("Upload failed, please try again");
			reset();
		} finally {
			setIsUploading(false);
		}
	};

	return {
		preview,
		tempKey,
		mimeType,
		isUploading,
		isVideoPreview: mimeType ? isVideo(mimeType) : false,
		handleFileChange,
		reset,
	};
};
