import { useEffect, useRef } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

const useLastFocusedElement = (
  formMethods: UseFormReturn<FieldValues, any, undefined>
) => {
  const lastFocusedRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(
    null
  );
  const insertTag = (tag: string) => {
    const inputElement = lastFocusedRef.current;
    if (!inputElement) {
      console.warn("No input or textarea was previously focused.");
      return;
    }

    const {
      selectionStart: start = 0,
      selectionEnd: end = 0,
      value,
    } = inputElement;

    const newValue = `${value.slice(0, start!)}{{${tag}}}${value.slice(end!)}`;

    inputElement.value = newValue;
    formMethods.setValue(inputElement.name, newValue);
    if (inputElement.id.includes("tag-input-tags")) {
      const inputEvent = new Event("input", { bubbles: true });
      Object.defineProperty(inputEvent, "target", {
        value: { value: newValue },
        configurable: true,
      });
      inputElement.setAttribute("value", newValue);
      inputElement.dispatchEvent(inputEvent);
      formMethods.setValue(inputElement.id, newValue, {
        shouldDirty: true,
        shouldTouch: true,
      });
      formMethods.trigger(inputElement.id);
      setTimeout(() => {
        const enterEvent = new KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true,
        });

        inputElement.dispatchEvent(enterEvent);
      }, 10); // Delay ensures value is set before event fires
    }

    // ✅ Restore cursor position and focus
    setTimeout(() => {
      inputElement.setSelectionRange(
        start! + `{{${tag}}}`.length,
        start! + `{{${tag}}}`.length
      );
      inputElement.focus();
    }, 0);
  };
  useEffect(() => {
    const handleFocusIn = (event: FocusEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        lastFocusedRef.current = event.target;
      }
    };

    document.addEventListener("focusin", handleFocusIn);
    return () => document.removeEventListener("focusin", handleFocusIn);
  }, []);

  return { insertTag };
};
export default useLastFocusedElement;
