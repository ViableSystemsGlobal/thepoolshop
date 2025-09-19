# Confirmation Modal System

A comprehensive confirmation modal system that provides a consistent UI for all confirmation dialogs throughout the application.

## Components

### 1. ConfirmationModal
The main modal component that displays confirmation dialogs.

```tsx
import { ConfirmationModal } from '@/components/modals/confirmation-modal';

<ConfirmationModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={onConfirm}
  title="Delete User"
  message="Are you sure you want to delete this user?"
  confirmText="Delete"
  cancelText="Cancel"
  type="danger"
  isLoading={false}
/>
```

### 2. useAsyncConfirmation Hook
A hook for managing async confirmation operations with loading states.

```tsx
import { useAsyncConfirmation } from '@/hooks/use-async-confirmation';

function MyComponent() {
  const confirmation = useAsyncConfirmation();

  const handleDelete = (user) => {
    confirmation.confirm(
      {
        title: 'Delete User',
        message: `Are you sure you want to delete "${user.name}"?`,
        confirmText: 'Delete User',
        cancelText: 'Cancel',
        type: 'danger'
      },
      async () => {
        // Async operation
        await deleteUser(user.id);
        showSuccess('User deleted successfully');
      }
    );
  };

  return (
    <>
      <button onClick={() => handleDelete(user)}>Delete User</button>
      
      <ConfirmationModal
        isOpen={confirmation.isOpen}
        onClose={confirmation.close}
        onConfirm={confirmation.handleConfirm}
        title={confirmation.options?.title || ''}
        message={confirmation.options?.message || ''}
        confirmText={confirmation.options?.confirmText}
        cancelText={confirmation.options?.cancelText}
        type={confirmation.options?.type}
        isLoading={confirmation.isLoading}
      />
    </>
  );
}
```

### 3. ConfirmationProvider (Optional)
A context provider for global confirmation management.

```tsx
import { ConfirmationProvider, useConfirmationModal } from '@/components/modals/confirmation-provider';

// Wrap your app
<ConfirmationProvider>
  <App />
</ConfirmationProvider>

// Use in components
function MyComponent() {
  const { confirm } = useConfirmationModal();

  const handleDelete = () => {
    confirm(
      {
        title: 'Delete Item',
        message: 'Are you sure?',
        type: 'danger'
      },
      () => {
        // Delete logic
      }
    );
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```

## Types

### Confirmation Options
```tsx
interface ConfirmationOptions {
  title: string;
  message: string;
  confirmText?: string;    // Default: "Confirm"
  cancelText?: string;     // Default: "Cancel"
  type?: 'danger' | 'warning' | 'info';  // Default: 'danger'
}
```

### Modal Types
- **danger**: Red styling for destructive actions (delete, remove)
- **warning**: Yellow styling for potentially harmful actions
- **info**: Blue styling for informational confirmations

## Features

- ✅ **Consistent UI**: Matches your application's design system
- ✅ **Loading States**: Built-in loading indicators for async operations
- ✅ **Type Safety**: Full TypeScript support
- ✅ **Accessibility**: Proper ARIA attributes and keyboard navigation
- ✅ **Error Handling**: Automatic error handling for failed operations
- ✅ **Reusable**: Easy to use across different components
- ✅ **Customizable**: Flexible styling and text options

## Usage Examples

### Simple Confirmation
```tsx
const confirmation = useAsyncConfirmation();

confirmation.confirm(
  {
    title: 'Save Changes',
    message: 'Do you want to save your changes?',
    type: 'info'
  },
  async () => {
    await saveData();
  }
);
```

### Destructive Action
```tsx
confirmation.confirm(
  {
    title: 'Delete Account',
    message: 'This will permanently delete your account and all data. This action cannot be undone.',
    confirmText: 'Delete Forever',
    cancelText: 'Keep Account',
    type: 'danger'
  },
  async () => {
    await deleteAccount();
  }
);
```

### Warning Action
```tsx
confirmation.confirm(
  {
    title: 'Reset Settings',
    message: 'This will reset all your settings to default values. Are you sure?',
    confirmText: 'Reset',
    type: 'warning'
  },
  async () => {
    await resetSettings();
  }
);
```

## Best Practices

1. **Always use confirmation modals** instead of browser `confirm()` dialogs
2. **Be descriptive** in your messages - explain what will happen
3. **Use appropriate types** - danger for destructive actions, warning for potentially harmful actions
4. **Handle errors gracefully** - the hook automatically handles async errors
5. **Provide clear action text** - use specific confirm/cancel button text
6. **Test loading states** - ensure your async operations show proper loading indicators
