import React from "react"
import "./vscode-components.css"

// Simple replacements for VSCode components that match the original API
// These use VS Code CSS variables and styling to maintain consistency

export interface VSCodeButtonProps {
	children: React.ReactNode
	onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
	appearance?: "primary" | "secondary" | "icon"
	disabled?: boolean
	className?: string
	style?: React.CSSProperties
	title?: string
}

export const VSCodeButton: React.FC<VSCodeButtonProps> = ({ 
	children, 
	onClick, 
	appearance = "secondary", 
	disabled = false,
	className = "",
	style,
	title
}) => {
	const baseClasses = "vscode-button"
	const appearanceClass = `vscode-button--${appearance}`
	const classes = `${baseClasses} ${appearanceClass} ${className}`.trim()

	return (
		<button 
			className={classes}
			onClick={onClick}
			disabled={disabled}
			title={title}
			{...(style && { style })}
		>
			{children}
		</button>
	)
}

export interface VSCodeLinkProps {
	children?: React.ReactNode
	href?: string
	onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
	className?: string
	target?: string
	rel?: string
	title?: string
	style?: React.CSSProperties
}

export const VSCodeLink: React.FC<VSCodeLinkProps> = ({ 
	children, 
	href,
	onClick,
	className = "",
	target = "_blank",
	rel = "noopener noreferrer",
	title,
	style
}) => {
	const classes = `vscode-link ${className}`.trim()

	return (
		<a 
			className={classes}
			href={href}
			onClick={onClick}
			target={target}
			rel={rel}
			title={title}
			{...(style && { style })}
		>
			{children}
		</a>
	)
}

export interface VSCodeCheckboxProps {
	children?: React.ReactNode
	checked?: boolean
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
	disabled?: boolean
	className?: string
}

export const VSCodeCheckbox: React.FC<VSCodeCheckboxProps> = ({ 
	children, 
	checked = false,
	onChange,
	disabled = false,
	className = ""
}) => {
	const classes = `vscode-checkbox ${className}`.trim()

	return (
		<label className={classes}>
			<input 
				type="checkbox"
				checked={checked}
				onChange={onChange}
				disabled={disabled}
			/>
			{children && <span className="vscode-checkbox-label">{children}</span>}
		</label>
	)
}

export interface VSCodeBadgeProps {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
}

export const VSCodeBadge: React.FC<VSCodeBadgeProps> = ({ 
	children,
	className = "",
	style
}) => {
	const classes = `vscode-badge ${className}`.trim()

	return (
		<span 
			className={classes}
			{...(style && { style })}
		>
			{children}
		</span>
	)
}

export interface VSCodeTextFieldProps {
	children?: React.ReactNode
	value?: string
	onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
	onInput?: (event: any) => void
	onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	type?: string
	style?: React.CSSProperties
	ref?: React.Ref<HTMLInputElement>
	onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}

export const VSCodeTextField: React.FC<VSCodeTextFieldProps> = ({ 
	children,
	value,
	onChange,
	onInput,
	onBlur,
	placeholder,
	disabled = false,
	className = "",
	type = "text",
	style,
	ref,
	onKeyDown
}) => {
	const classes = `vscode-textfield ${className}`.trim()

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(event)
		}
		if (onInput) {
			onInput(event)
		}
	}

	return (
		<div className="vscode-textfield-container">
			<input 
				ref={ref}
				className={classes}
				type={type}
				value={value}
				onChange={handleChange}
				onInput={onInput}
				onBlur={onBlur}
				onKeyDown={onKeyDown}
				placeholder={placeholder}
				disabled={disabled}
				{...(style && { style })}
			/>
			{children && <span className="vscode-textfield-children">{children}</span>}
		</div>
	)
}

export interface VSCodeProgressRingProps {
	className?: string
}

export const VSCodeProgressRing: React.FC<VSCodeProgressRingProps> = ({ 
	className = ""
}) => {
	const classes = `vscode-progress-ring ${className}`.trim()

	return (
		<div className={classes}>
			<svg viewBox="0 0 16 16">
				<circle cx="8" cy="8" r="7" />
			</svg>
		</div>
	)
}

export interface VSCodeTextAreaProps {
	value?: string
	onChange?: (event: React.ChangeEvent<HTMLTextAreaElement>) => void
	placeholder?: string
	disabled?: boolean
	className?: string
	rows?: number
	resize?: 'none' | 'both' | 'horizontal' | 'vertical'
	style?: React.CSSProperties
}

export const VSCodeTextArea: React.FC<VSCodeTextAreaProps> = ({ 
	value,
	onChange,
	placeholder,
	disabled = false,
	className = "",
	rows = 4,
	resize,
	style
}) => {
	const classes = `vscode-textarea ${className}`.trim()
	const resizeClasses = resize ? `vscode-textarea--resize-${resize}` : ''
	const finalClasses = `${classes} ${resizeClasses}`.trim()

	return (
		<textarea 
			className={finalClasses}
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			disabled={disabled}
			rows={rows}
			{...(style && { style })}
		/>
	)
}

export interface VSCodeRadioProps {
	checked?: boolean
	onChange?: (checked: boolean) => void
	disabled?: boolean
	children?: React.ReactNode
	className?: string
	value?: string
	name?: string
	'aria-label'?: string
}

export const VSCodeRadio: React.FC<VSCodeRadioProps> = ({ 
	checked = false, 
	onChange, 
	disabled = false, 
	children, 
	className = '',
	value,
	name,
	...props
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (onChange) {
			onChange(e.target.checked)
		}
	}

	return (
		<label className={`vscode-radio ${className}`}>
			<input
				type="radio"
				checked={checked}
				onChange={handleChange}
				disabled={disabled}
				value={value}
				name={name}
				aria-label={props['aria-label']}
			/>
			{children && <span className="vscode-radio-label">{children}</span>}
		</label>
	)
}

export interface VSCodeRadioGroupProps {
	children: React.ReactNode
	className?: string
	orientation?: 'horizontal' | 'vertical'
	value?: string
	onChange?: (value: string) => void
	name?: string
}

export const VSCodeRadioGroup: React.FC<VSCodeRadioGroupProps> = ({ 
	children, 
	className = '',
	orientation = 'vertical',
	value,
	onChange,
	name
}) => {
	const handleRadioChange = (radioValue: string) => {
		if (onChange) {
			onChange(radioValue)
		}
	}

	const enhancedChildren = React.Children.map(children, (child) => {
		if (React.isValidElement(child) && child.type === VSCodeRadio) {
			return React.cloneElement(child as React.ReactElement<VSCodeRadioProps>, {
				checked: child.props.value === value,
				onChange: () => handleRadioChange(child.props.value || ''),
				name: name || child.props.name
			})
		}
		return child
	})

	return (
		<div className={`vscode-radio-group vscode-radio-group--${orientation} ${className}`}>
			{enhancedChildren}
		</div>
	)
}

// Placeholder components for complex ones that are missing
export interface VSCodeDropdownProps {
	children: React.ReactNode
	className?: string
	value?: string
	onChange?: (value: string) => void
	'aria-label'?: string
	title?: string
}

export const VSCodeDropdown: React.FC<VSCodeDropdownProps> = ({ 
	children,
	className = "",
	value,
	onChange,
	...props
}) => {
	const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		if (onChange) {
			onChange(e.target.value)
		}
	}

	return (
		<select 
			className={`vscode-dropdown ${className}`}
			value={value}
			onChange={handleChange}
			aria-label={props['aria-label'] || 'Dropdown'}
			title={props.title}
		>
			{children}
		</select>
	)
}

export interface VSCodeOptionProps {
	children: React.ReactNode
	value: string
	className?: string
}

export const VSCodeOption: React.FC<VSCodeOptionProps> = ({ 
	children,
	value,
	className = ""
}) => {
	return (
		<option value={value} className={className}>
			{children}
		</option>
	)
}

// Panel components - simplified implementation
export interface VSCodePanelsProps {
	children: React.ReactNode
	className?: string
	style?: React.CSSProperties
}

export const VSCodePanels: React.FC<VSCodePanelsProps> = ({ 
	children,
	className = "",
	style
}) => {
	return (
		<div 
			className={`vscode-panels ${className}`}
			{...(style && { style })}
		>
			{children}
		</div>
	)
}

export interface VSCodePanelTabProps {
	children: React.ReactNode
	id?: string
	className?: string
}

export const VSCodePanelTab: React.FC<VSCodePanelTabProps> = ({ 
	children,
	id,
	className = ""
}) => {
	return (
		<div className={`vscode-panel-tab ${className}`} id={id}>
			{children}
		</div>
	)
}

export interface VSCodePanelViewProps {
	children: React.ReactNode
	id?: string
	className?: string
}

export const VSCodePanelView: React.FC<VSCodePanelViewProps> = ({ 
	children,
	id,
	className = ""
}) => {
	return (
		<div className={`vscode-panel-view ${className}`} id={id}>
			{children}
		</div>
	)
}