export {};

declare global {
    namespace AlpineJSComponent {        
        type GCPEditor = import("./alpineComponents/GCPEditor").GCPEditorComponent;
        type OptionsForm = import("./alpineComponents/OptionsForm").FormComponent;
        type UppyWidget = import("./alpineComponents/UppyWidgets").UppyWidgetComponent;
    }
}