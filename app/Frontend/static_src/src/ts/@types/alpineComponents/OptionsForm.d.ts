interface FieldData {
    fileUploaded?: boolean;
    isJSONValid?: boolean;
}

interface FormComponent {
    $el?: HTMLElement;
    formData: Record<string, any>;
    handleFileUpload(event: Event, data: FieldData, fieldName: string): void;
    handleJSON(event: Event, data: FieldData, fieldName: string): void;
    handleFocus(event: KeyboardEvent): void;
}

export {
    FieldData, 
    FormComponent,
}