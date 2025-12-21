import { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Hook de validation de formulaires
 * @param {Object} initialValues - Valeurs initiales du formulaire
 * @param {Object} validationRules - Règles de validation par champ
 * @returns {Object} - État et fonctions de validation
 */
export function useFormValidation(initialValues = {}, validationRules = {}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Règles de validation prédéfinies
  const validators = {
    required: (value, message = "Ce champ est requis") => {
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        return message;
      }
      return null;
    },
    email: (value, message = "Email invalide") => {
      // Regex simple et sûr - pas de backtracking
      if (value && value.length > 0) {
        const atIndex = value.indexOf('@');
        const dotIndex = value.lastIndexOf('.');
        if (atIndex < 1 || dotIndex < atIndex + 2 || dotIndex >= value.length - 1) {
          return message;
        }
      }
      return null;
    },
    minLength: (value, min, message) => {
      if (value && value.length < min) {
        return message || `Minimum ${min} caractères`;
      }
      return null;
    },
    maxLength: (value, max, message) => {
      if (value && value.length > max) {
        return message || `Maximum ${max} caractères`;
      }
      return null;
    },
    pattern: (value, pattern, message = "Format invalide") => {
      if (value && !pattern.test(value)) {
        return message;
      }
      return null;
    },
    fileSize: (file, maxSizeMB, message) => {
      if (file && file.size > maxSizeMB * 1024 * 1024) {
        return message || `Taille maximale: ${maxSizeMB}MB`;
      }
      return null;
    },
    fileType: (file, allowedTypes, message) => {
      if (file && !allowedTypes.some(type => file.type.includes(type) || file.name.endsWith(type))) {
        return message || `Types autorisés: ${allowedTypes.join(', ')}`;
      }
      return null;
    },
  };

  // Valider un champ
  const validateField = useCallback((name, value) => {
    const rules = validationRules[name];
    if (!rules) return null;

    for (const rule of rules) {
      let error = null;
      
      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object') {
        const { type, ...params } = rule;
        if (validators[type]) {
          error = validators[type](value, ...Object.values(params));
        }
      } else if (typeof rule === 'string' && validators[rule]) {
        error = validators[rule](value);
      }

      if (error) return error;
    }
    return null;
  }, [validationRules]);

  // Mettre à jour une valeur
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  }, [touched, validateField]);

  // Marquer un champ comme touché
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, values[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  }, [values, validateField]);

  // Valider tout le formulaire
  const validateAll = useCallback(() => {
    const newErrors = {};
    const newTouched = {};
    let isValid = true;

    Object.keys(validationRules).forEach(name => {
      newTouched[name] = true;
      const error = validateField(name, values[name]);
      if (error) {
        newErrors[name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return isValid;
  }, [values, validationRules, validateField]);

  // Réinitialiser le formulaire
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  }, [initialValues]);

  // Helper pour obtenir les props d'un input
  const getFieldProps = useCallback((name) => ({
    name,
    value: values[name] || '',
    onChange: (e) => handleChange(name, e.target.value),
    onBlur: () => handleBlur(name),
    error: touched[name] && errors[name],
  }), [values, errors, touched, handleChange, handleBlur]);

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    getFieldProps,
    setValues,
    isValid: Object.keys(errors).length === 0,
  };
}

/**
 * Composant d'input avec validation intégrée
 */
export function ValidatedInput({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  className = '',
  required = false,
  disabled = false,
  ...props
}) {
  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={name}
          className="block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={placeholder}
        className={`
          w-full px-4 py-3 border rounded-xl transition-all duration-200
          ${error 
            ? 'border-red-300 focus:border-red-400 focus:ring-red-500/20 bg-red-50 dark:bg-red-900/20' 
            : 'border-slate-200 dark:border-slate-700 focus:border-indigo-400 focus:ring-indigo-500/20 bg-white dark:bg-slate-800'
          }
          focus:outline-none focus:ring-2
          disabled:bg-slate-100 disabled:cursor-not-allowed
          text-slate-700 dark:text-slate-200 placeholder:text-slate-400
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * Composant de validation de fichier
 */
export function validateFile(file, options = {}) {
  const { 
    maxSizeMB = 10, 
    allowedTypes = ['pdf', 'doc', 'docx', 'txt'],
    required = false 
  } = options;

  const errors = [];

  if (required && !file) {
    errors.push('Veuillez sélectionner un fichier');
    return errors;
  }

  if (!file) return errors;

  // Vérifier la taille
  if (file.size > maxSizeMB * 1024 * 1024) {
    errors.push(`La taille du fichier dépasse ${maxSizeMB}MB`);
  }

  // Vérifier le type
  const extension = file.name.split('.').pop().toLowerCase();
  const isValidType = allowedTypes.some(type => 
    file.type.includes(type) || extension === type
  );
  
  if (!isValidType) {
    errors.push(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`);
  }

  return errors;
}

ValidatedInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  error: PropTypes.string,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
};

ValidatedInput.defaultProps = {
  label: null,
  type: 'text',
  value: '',
  onChange: () => {},
  onBlur: () => {},
  error: null,
  placeholder: '',
  className: '',
  required: false,
  disabled: false,
};

export default useFormValidation;
