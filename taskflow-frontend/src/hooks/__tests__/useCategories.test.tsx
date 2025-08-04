import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../useCategories';
import { NotificationProvider } from '../../contexts/NotificationContext';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../__tests__/utils/i18n-test';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
};

describe('useCategories Hook', () => {
  describe('useCategories', () => {
    it('should fetch categories', async () => {
      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toBeDefined();
      expect(Array.isArray(result.current.data)).toBe(true);
    });
  });

  describe('useCreateCategory', () => {
    it('should provide create category mutation', () => {
      const { result } = renderHook(() => useCreateCategory(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useUpdateCategory', () => {
    it('should provide update category mutation', () => {
      const { result } = renderHook(() => useUpdateCategory(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });
  });

  describe('useDeleteCategory', () => {
    it('should provide delete category mutation', () => {
      const { result } = renderHook(() => useDeleteCategory(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });
  });
});
