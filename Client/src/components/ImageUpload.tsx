import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next'; 

declare global {
    interface Window {
        cloudinary: any;
    }
}

interface Props {
    onUploadSuccess: (url: string) => void;
}

export default function ImageUpload({ onUploadSuccess }: Props) {
    const { t } = useTranslation(); 
    const cloudinaryRef = useRef<any>();
    const widgetRef = useRef<any>();

    // Store the function in a ref so it doesn't trigger re-renders
    const callbackRef = useRef(onUploadSuccess);
    useEffect(() => {
        callbackRef.current = onUploadSuccess;
    }, [onUploadSuccess]);

    useEffect(() => {
        // Initialize the widget once when the component loads
        cloudinaryRef.current = window.cloudinary;
        widgetRef.current = cloudinaryRef.current?.createUploadWidget({
            cloudName: 'dac4m7xrb',
            uploadPreset: 'Inventory_app',
            multiple: false,
            clientAllowedFormats: ['image'],
            maxFileSize: 5000000
        }, function(error: any, result: any) {
            if (!error && result && result.event === "success") {
                // Use the ref to call the function!
                callbackRef.current(result.info.secure_url);
            }
        });
    }, []); 

    return (
        <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => widgetRef.current?.open()}
        >
            <i className="bi bi-cloud-arrow-up me-2"></i> 
            {t('btn_upload_image')}
        </button>
    );
}