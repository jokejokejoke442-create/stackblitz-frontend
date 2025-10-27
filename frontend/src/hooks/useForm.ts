'use client';

import { useState, useCallback } from 'react';

interface UseFormProps<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  validate?: (values: T) => Record<keyof T, string>;
}

interface UseFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  touched: Record<keyof T, boolean>;
  isLoading: boolean;
  isSubmitting: boolean;
  handleChange: (field: keyof T) => (value: T[keyof T]) => void;
  handleBlur: (field: keyof T) => () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  resetForm: () => void;
  setFieldValue: (field: keyof T, value: T[keyof T]) => void;
  setErrors: (errors: Record<keyof T, string>) => void;
  clearErrors: () => void;
  isValid: boolean;
}

export const useForm = <T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate,
}: UseFormProps<T>): UseFormReturn<T> => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>(
    {} as Record<keyof T, string>
  );
  const [touched, setTouched] = useState<Record<keyof T, boolean>>(
    {} as Record<keyof T, boolean>
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = useCallback(
    (field: keyof T) => (value: T[keyof T]) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Clear error for this field when user starts typing
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: '' as any }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (field: keyof T) => () => {
      setTouched((prev) => ({ ...prev, [field]: true }));

      // Validate field on blur
      if (validate) {
        const fieldErrors = validate(values);
        if (fieldErrors[field]) {
          setErrors((prev) => ({ ...prev, [field]: fieldErrors[field] }));
        }
      }
    },
    [validate, values]
  );

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) {
        e.preventDefault();
      }

      // Validate all fields
      if (validate) {
        const validationErrors = validate(values);
        setErrors(validationErrors);

        // Check if there are any errors
        const hasErrors = Object.values(validationErrors).some(
          (error) => error
        );
        if (hasErrors) {
          return;
        }
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, values, onSubmit]
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({} as Record<keyof T, string>);
    setTouched({} as Record<keyof T, boolean>);
    setIsSubmitting(false);
  }, [initialValues]);

  const setFieldValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string>);
  }, []);

  const isValid = validate
    ? !Object.values(validate(values)).some((error) => error)
    : true;

  return {
    values,
    errors,
    touched,
    isLoading: isSubmitting,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFieldValue,
    setErrors,
    clearErrors,
    isValid,
  };
};