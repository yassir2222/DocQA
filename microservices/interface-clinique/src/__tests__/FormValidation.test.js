import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useFormValidation, ValidatedInput, validateFile } from '../hooks/useFormValidation';
import { renderHook, act } from '@testing-library/react';

describe('useFormValidation Hook', () => {
  const validationRules = {
    email: [
      { type: 'required', message: 'Email requis' },
      { type: 'email', message: 'Email invalide' },
    ],
    password: [
      { type: 'required', message: 'Mot de passe requis' },
      { type: 'minLength', min: 6, message: 'Minimum 6 caractères' },
    ],
  };

  test('initialise avec les valeurs par défaut', () => {
    const { result } = renderHook(() => 
      useFormValidation({ email: '', password: '' }, validationRules)
    );

    expect(result.current.values.email).toBe('');
    expect(result.current.values.password).toBe('');
    expect(result.current.errors).toEqual({});
  });

  test('handleChange met à jour les valeurs', () => {
    const { result } = renderHook(() => 
      useFormValidation({ email: '', password: '' }, validationRules)
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
    });

    expect(result.current.values.email).toBe('test@example.com');
  });

  test('validateAll retourne false pour données invalides', () => {
    const { result } = renderHook(() => 
      useFormValidation({ email: '', password: '' }, validationRules)
    );

    let isValid;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.email).toBe('Email requis');
    expect(result.current.errors.password).toBe('Mot de passe requis');
  });

  test('validateAll retourne true pour données valides', () => {
    const { result } = renderHook(() => 
      useFormValidation({ email: 'test@example.com', password: 'password123' }, validationRules)
    );

    let isValid;
    act(() => {
      isValid = result.current.validateAll();
    });

    expect(isValid).toBe(true);
    expect(result.current.errors).toEqual({});
  });

  test('reset réinitialise le formulaire', () => {
    const initialValues = { email: '', password: '' };
    const { result } = renderHook(() => 
      useFormValidation(initialValues, validationRules)
    );

    act(() => {
      result.current.handleChange('email', 'test@example.com');
      result.current.handleChange('password', '123456');
    });

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.errors).toEqual({});
  });
});

describe('validateFile Function', () => {
  test('retourne erreur si fichier requis mais absent', () => {
    const errors = validateFile(null, { required: true });
    expect(errors).toContain('Veuillez sélectionner un fichier');
  });

  test('retourne erreur si fichier trop volumineux', () => {
    const file = new File(['x'.repeat(20 * 1024 * 1024)], 'large.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 20 * 1024 * 1024 });
    
    const errors = validateFile(file, { maxSizeMB: 10 });
    expect(errors.some(e => e.includes('10MB'))).toBe(true);
  });

  test('retourne erreur si type de fichier non autorisé', () => {
    const file = new File(['test'], 'test.exe', { type: 'application/x-msdownload' });
    
    const errors = validateFile(file, { allowedTypes: ['pdf', 'doc', 'docx'] });
    expect(errors.some(e => e.includes('Type de fichier'))).toBe(true);
  });

  test('ne retourne pas d\'erreur pour fichier valide', () => {
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 }); // 1MB
    
    const errors = validateFile(file, { maxSizeMB: 10, allowedTypes: ['pdf'] });
    expect(errors).toHaveLength(0);
  });
});

describe('ValidatedInput Component', () => {
  test('affiche le label', () => {
    render(
      <ValidatedInput
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        onBlur={() => {}}
      />
    );

    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  test('affiche l\'indicateur requis', () => {
    render(
      <ValidatedInput
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        onBlur={() => {}}
        required
      />
    );

    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('affiche le message d\'erreur', () => {
    render(
      <ValidatedInput
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        onBlur={() => {}}
        error="Ce champ est requis"
      />
    );

    expect(screen.getByText('Ce champ est requis')).toBeInTheDocument();
  });

  test('appelle onChange lors de la saisie', async () => {
    const handleChange = jest.fn();
    render(
      <ValidatedInput
        label="Email"
        name="email"
        value=""
        onChange={handleChange}
        onBlur={() => {}}
      />
    );

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'test');

    expect(handleChange).toHaveBeenCalled();
  });

  test('appelle onBlur lors du blur', async () => {
    const handleBlur = jest.fn();
    render(
      <ValidatedInput
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        onBlur={handleBlur}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.blur(input);

    expect(handleBlur).toHaveBeenCalled();
  });
});
