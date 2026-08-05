import React from 'react'
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { AppInput, type AppInputProps } from './AppInput'

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> extends Omit<AppInputProps, 'value' | 'onChangeText' | 'error'> {
  control: Control<TFieldValues>
  name: TName
}

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({ control, name, ...inputProps }: FormFieldProps<TFieldValues, TName>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <AppInput
          {...inputProps}
          value={value != null ? String(value) : ''}
          onChangeText={onChange}
          onBlur={onBlur}
          {...(error?.message ? { error: error.message } : {})}
        />
      )}
    />
  )
}
