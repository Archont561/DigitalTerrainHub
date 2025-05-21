namespace HTMX {
    interface ExtensionAPI {
        addTriggerHandler(
            elt: Element,
            triggerSpec: any,
            nodeData: any,
            handler: EventListener
        ): void;
        bodyContains(elt: Element): boolean;
        canAccessLocalStorage(): boolean;
        filterValues(inputValues: FormData, elt: Element): FormData;
        findThisElement(elt: Element, attribute: string): Element | null;
        getAttributeValue(elt: Element, qualifiedName: string): string | null;
        getClosestAttributeValue(elt: Element, attributeName: string): string | null;
        getClosestMatch(elt: Element, condition: (el: Element) => boolean): Element | null;
        getExpressionVars(elt: Element): Record<string, any>;
        getHeaders(
            elt: Element,
            target: Element,
            prompt: string | null
        ): HeadersInit;
        getInputValues(elt: Element, verb: string): FormData;
        getInternalData(elt: Element): Record<string, any>;
        getSwapSpecification(
            elt: Element,
            swapInfoOverride?: string
        ): any;
        getTarget(elt: Element): Element | null;
        getTriggerSpecs(elt: Element): any[];
        hasAttribute(elt: Element, qualifiedName: string): boolean;
        makeFragment(response: string): DocumentFragment;
        makeSettleInfo(target: Element): any;
        mergeObjects<T extends object, U extends object>(obj1: T, obj2: U): T & U;
        oobSwap(
            oobValue: string,
            oobElement: Element,
            settleInfo: any,
            rootNode: Node
        ): void;
        querySelectorExt(
            eltOrSelector: Element | string,
            selector: string
        ): Element | null;
        settleImmediately(tasks: (() => void)[]): void;
        shouldCancel(evt: Event, node: Element): boolean;
        swap(
            target: Element,
            content: DocumentFragment | Element | string,
            swapSpec: any,
            swapOptions: any
        ): void;
        triggerErrorEvent(
            elt: Element,
            eventName: string,
            detail: any
        ): boolean;
        triggerEvent(
            elt: Element,
            eventName: string,
            detail: any
        ): boolean;
        withExtensions(
            elt: Element,
            toDo: (extension: any) => void
        ): void;
    }

    interface Extension {
        init?: (api: ExtensionAPI) => void;
        getSelectors?: () => string[] | null;
        onEvent?: (name: string, evt: CustomEvent) => void;
        transformResponse?: (text: string, xhr: XMLHttpRequest, elt: Element) => string;
        isInlineSwap?: (swapStyle: SwapStyle) => boolean;
        handleSwap?: (swapStyle: SwapStyle, target: Element, fragment: DocumentFragment, settleInfo: any) => boolean;
        encodeParameters?: (xhr: XMLHttpRequest, parameters: any, elt: Element) => void;
    }

    type SwapStyle =
        | 'innerHTML'
        | 'outerHTML'
        | 'beforebegin'
        | 'afterbegin'
        | 'beforeend'
        | 'afterend'
        | 'delete'
        | 'none';

    interface SwapSpec {
        swapStyle: SwapStyle;
        swapDelay?: number;
        settleDelay?: number;
        transition?: boolean;
        ignoreTitle?: boolean;
        head?: 'merge' | 'append' | '';
        scroll?: boolean;
        scrollTarget?: string | Element;
        show?: boolean;
        showTarget?: string | Element;
        focusScroll?: boolean;
        swapOptions?: Record<string, any>;
        select?: string;
        selectOOB?: string;
        eventInfo?: Record<string, any>;
        anchor?: Element;
        contextElement?: Element;
        afterSwapCallback?: () => void;
        afterSettleCallback?: () => void;
    }

    interface AjaxContext {
        source?: Element;
        event?: Event;
        handler?: (response: string) => void;
        target?: string | Element;
        swap?: SwapStyle;
        values?: Record<string, any>;
        headers?: Record<string, string>;
        select?: string;
    }

    interface Config {
        attributesToSettle: string[];
        refreshOnHistoryMiss: boolean;
        defaultSettleDelay: number;
        defaultSwapDelay: number;
        defaultSwapStyle: SwapStyle;
        historyCacheSize: number;
        historyEnabled: boolean;
        includeIndicatorStyles: boolean;
        indicatorClass: string;
        requestClass: string;
        addedClass: string;
        settlingClass: string;
        swappingClass: string;
        allowEval: boolean;
        allowScriptTags: boolean;
        inlineScriptNonce: string;
        inlineStyleNonce: string;
        withCredentials: boolean;
        timeout: number;
        wsReconnectDelay: string | (() => number);
        wsBinaryType: 'blob' | 'arraybuffer';
        disableSelector: string;
        disableInheritance: boolean;
        scrollBehavior: 'instant' | 'smooth' | 'auto';
        defaultFocusScroll: boolean;
        getCacheBusterParam: boolean;
        globalViewTransitions: boolean;
        methodsThatUseUrlParams: string[];
        selfRequestsOnly: boolean;
        ignoreTitle: boolean;
        scrollIntoViewOnBoost: boolean;
        triggerSpecsCache: any;
        responseHandling: any[];
        allowNestedOobSwaps: boolean;
    }

    interface Instance {
        config: Config;
        logger(elt: Element, event: string, detail: any): void;
        createWebSocket(url: string): WebSocket;
        createEventSource(url: string): EventSource;
        addClass(elt: Element, className: string, delay?: number): void;
        ajax(
            verb: string,
            path: string,
            targetOrContext?: string | Element | AjaxContext
        ): Promise<void>;
        closest(elt: Element, selector: string): Element | null;
        defineExtension(name: string, ext: Extension): void;
        find(selector: string): Element | null;
        find(elt: Element, selector: string): Element | null;
        findAll(selector: string): Element[];
        findAll(elt: Element, selector: string): Element[];
        logAll(): void;
        logNone(): void;
        off(eventName: string, listener: EventListener): void;
        off(target: Element | string, eventName: string, listener: EventListener): void;
        on(eventName: string, listener: EventListener, options?: boolean | AddEventListenerOptions): EventListener;
        on(target: Element | string, eventName: string, listener: EventListener, options?: boolean | AddEventListenerOptions): EventListener;
        onLoad(callback: (elt: Element) => void): void;
        parseInterval(str: string): number;
        process(elt: Element): void;
        remove(elt: Element, delay?: number): void;
        removeClass(elt: Element, className: string, delay?: number): void;
        removeExtension(name: string): void;
        swap(target: Element | string, content: string, spec: SwapSpec): void;
        takeClass(elt: Element, className: string): void;
        toggleClass(elt: Element, className: string): void;
        trigger(elt: Element | string, name: string, detail?: any): void;
        values(elt: Element, requestType?: string): Record<string, any>;
    }
}

export declare global {
    var htmx: HTMX.Instance;
}

export {
    HTMX
}
