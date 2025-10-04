# `useAstroAction` Hook Documentation

A React hook for seamlessly working with Astro Actions, supporting both form submissions and direct action calls.

## Installation

Place the hook in your project's hooks directory.

## Import

```tsx
import { useAstroAction } from "@/hooks/useAstroAction";
```

## Type Parameters

- `T` - The type of state returned by the action (default: `any`)
- `R` - The expected return type of the action itself (default: `any`)

## Parameters

| Parameter      | Type                          | Description                               | Default    |
| -------------- | ----------------------------- | ----------------------------------------- | ---------- |
| `action`       | `(data: any) => Promise<any>` | The Astro action function to execute      | (required) |
| `initialState` | `T \| null`                   | Initial state before the action is called | `null`     |

## Return Values

| Property     | Type                                              | Description                                                                  |
| ------------ | ------------------------------------------------- | ---------------------------------------------------------------------------- |
| `state`      | `T \| null`                                       | Current state after action execution, contains `data` and `error` properties |
| `isPending`  | `boolean`                                         | Indicates if the action is currently processing                              |
| `formAction` | `(e: FormEvent<HTMLFormElement>) => Promise<any>` | Event handler for form submissions                                           |
| `execute`    | `(data?: any) => Promise<any>`                    | Function to execute the action directly with optional data                   |
| `setState`   | `Dispatch<SetStateAction<T \| null>>`             | React setState function to manually update state                             |

## Basic Usage

### Form Submission

```tsx
import { useAstroAction } from "@/hooks/useAstroAction";
import { authActions } from "@/actions/auth";

export function LoginForm() {
  const { state, isPending, formAction } = useAstroAction(authActions.login);
  
  return (
    <form onSubmit={formAction} className="space-y-4">
      {state?.error && <div className="error">{state.error}</div>}
      
      <div>
        <label htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required />
      </div>
      
      <div>
        <label htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required />
      </div>
      
      <button type="submit" disabled={isPending}>
        {isPending ? "Logging in..." : "Login"}
      </button>
      
      {state?.data?.success && <p>Login successful!</p>}
    </form>
  );
}
```

### Direct Action Call (e.g., Button Click)

```tsx
import { useAstroAction } from "@/hooks/useAstroAction";
import { authActions } from "@/actions/auth";

export function LogoutButton() {
  const { isPending, execute } = useAstroAction(authActions.logout);
  
  return (
    <button 
      onClick={() => execute()}
      disabled={isPending}
      className="btn btn-danger"
    >
      {isPending ? "Logging out..." : "Logout"}
    </button>
  );
}
```

### With Custom Data

```tsx
import { useAstroAction } from "@/hooks/useAstroAction";
import { postActions } from "@/actions/posts";

export function DeletePost({ postId }) {
  const { state, isPending, execute } = useAstroAction(postActions.deletePost);
  
  const handleDelete = async () => {
    const result = await execute({ id: postId });
    if (result.data?.success) {
      // Handle successful deletion
      navigate('/posts');
    }
  };
  
  return (
    <div>
      {state?.error && <div className="error">{state.error}</div>}
      <button 
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? "Deleting..." : "Delete Post"}
      </button>
    </div>
  );
}
```

## With TypeScript

```tsx
interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface LoginError {
  type: string;
  issues: Array<any>;
  fields: Record<string, string[]>;
}

interface LoginState {
  data?: LoginResponse;
  error?: LoginError | string;
}

function LoginForm() {
  const { 
    state, 
    isPending, 
    formAction 
  } = useAstroAction<LoginState>(authActions.login);
  
  // Now state.data and state.error are properly typed
  return (
    <form onSubmit={formAction}>
      {/* Form fields */}
      {state?.data?.user && <p>Welcome, {state.data.user.name}!</p>}
    </form>
  );
}
```

## Advanced Usage

### Handling Action Results

```tsx
function RegisterForm() {
  const { formAction, isPending } = useAstroAction(authActions.signup);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    const result = await formAction(e);
    if (result.data?.data?.success) {
      navigate('/dashboard');
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Manual State Updates

```tsx
function ProfileEditor() {
  const { 
    state, 
    isPending, 
    execute, 
    setState 
  } = useAstroAction(profileActions.update);
  
  // Reset form state or handle specific conditions
  const resetForm = () => {
    setState(null);
  };
  
  return (
    <div>
      {/* Form or UI elements */}
      <button onClick={resetForm}>Reset</button>
    </div>
  );
}
```

## Error Handling

The hook automatically handles errors from the Astro action and transforms them into a consistent state format:

```tsx
function SensitiveAction() {
  const { state, execute } = useAstroAction(someRiskyAction);
  
  return (
    <div>
      <button onClick={() => execute()}>
        Perform Action
      </button>
      
      {state?.error && (
        <div className="alert alert-danger">
          {typeof state.error === 'string' 
            ? state.error 
            : 'An error occurred'}
        </div>
      )}
    </div>
  );
}
```

## Best Practices

1. **Provide type parameters** for better TypeScript support and editor auto-completion
2. **Initialize state** when you need default values before the first action call
3. **Check isPending** to disable buttons/forms during action execution
4. **Use the return value** from `formAction`/`execute` for immediate handling
5. **Handle both success and error states** in your UI
6. **Consider request deduplication** for actions that shouldn't be called multiple times

## Notes

- The hook uses React's `useState` internally, so it follows React's state update rules
- Actions are executed asynchronously, so state updates will be reflected after the Promise resolves
- Both `formAction` and `execute` return the raw result from the action for immediate handling
- Error handling is consistent between form submissions and direct calls

Similar code found with 1 license type