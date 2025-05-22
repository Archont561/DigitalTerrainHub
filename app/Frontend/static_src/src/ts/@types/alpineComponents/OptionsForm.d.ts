import { AlpineComponent } from 'alpinejs';

interface FieldData {
    fileUploaded?: boolean;
    isJSONValid?: boolean;
}

interface FormParser {
    formData: Record<string, any>;
    handleFileUpload(event: Event, data: FieldData, fieldName: string): void;
    handleJSON(event: Event, data: FieldData, fieldName: string): void;
    handleFocus(event: KeyboardEvent): void;
}

type FormComponent = AlpineComponent<FormParser>;

export {
    FieldData, 
    FormComponent,
}