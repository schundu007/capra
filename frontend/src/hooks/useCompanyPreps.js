import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { getApiUrl } from './useElectron.js';

const API_URL = getApiUrl();

const EMPTY_INPUTS = {
  jobDescription: '',
  resume: '',
  coverLetter: '',
  prepMaterials: '',
  documentation: [],
};

const EMPTY_GENERATED = {
  pitch: null,
  hr: null,
  'hiring-manager': null,
  rrk: null,
  coding: null,
  'system-design': null,
  behavioral: null,
  techstack: null,
};

/**
 * Hook for managing company interview prep data
 * Uses Supabase for webapp users, localStorage for Electron users
 */
export function useCompanyPreps() {
  const { useSupabaseAuth, isAuthenticated, getAccessToken, canCreateCompany: checkCanCreate, refreshUserData } = useAuth();

  const [companies, setCompanies] = useState([]);
  const [activeCompany, setActiveCompany] = useState(null);
  const [activeCompanyId, setActiveCompanyId] = useState(null);
  const [inputs, setInputs] = useState({ ...EMPTY_INPUTS });
  const [generated, setGenerated] = useState({ ...EMPTY_GENERATED });
  const [customSections, setCustomSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine storage mode
  const useCloudStorage = useSupabaseAuth && isAuthenticated;

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [useCloudStorage, isAuthenticated]);

  // Load company data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (useCloudStorage) {
        // Load from Supabase via API
        const token = await getAccessToken();
        const res = await fetch(`${API_URL}/api/company-preps`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load company preps');

        const { preps } = await res.json();

        // Transform to our format
        const companyNames = preps.map(p => p.company_name);
        const activePrep = preps[0]; // Most recently updated

        setCompanies(companyNames);

        if (activePrep) {
          setActiveCompany(activePrep.company_name);
          setActiveCompanyId(activePrep.id);
          setInputs(activePrep.inputs || { ...EMPTY_INPUTS });
          setGenerated(activePrep.generated || { ...EMPTY_GENERATED });
          setCustomSections(activePrep.custom_sections || []);
        } else {
          setActiveCompany(null);
          setActiveCompanyId(null);
          setInputs({ ...EMPTY_INPUTS });
          setGenerated({ ...EMPTY_GENERATED });
          setCustomSections([]);
        }
      } else {
        // Load from localStorage
        const stored = localStorage.getItem('interviewPrepCompanies');
        if (stored) {
          const data = JSON.parse(stored);
          setCompanies(data.companies || []);
          setActiveCompany(data.activeCompany);

          if (data.activeCompany && data.data[data.activeCompany]) {
            setInputs(data.data[data.activeCompany].inputs || { ...EMPTY_INPUTS });
            setGenerated(data.data[data.activeCompany].generated || { ...EMPTY_GENERATED });
            setCustomSections(data.data[data.activeCompany].customSections || []);
          }
        }
      }
    } catch (err) {
      console.error('Load company preps error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [useCloudStorage, getAccessToken]);

  // Save current company data
  const saveCurrentCompany = useCallback(async () => {
    if (!activeCompany) return;

    try {
      if (useCloudStorage && activeCompanyId) {
        // Save to Supabase via API
        const token = await getAccessToken();
        await fetch(`${API_URL}/api/company-preps/${activeCompanyId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            inputs,
            generated,
            custom_sections: customSections,
          }),
        });
      } else {
        // Save to localStorage
        const stored = localStorage.getItem('interviewPrepCompanies');
        const data = stored ? JSON.parse(stored) : { companies: [], activeCompany: null, data: {} };

        data.data[activeCompany] = { inputs, generated, customSections };
        data.activeCompany = activeCompany;

        localStorage.setItem('interviewPrepCompanies', JSON.stringify(data));
      }
    } catch (err) {
      console.error('Save company prep error:', err);
    }
  }, [useCloudStorage, activeCompany, activeCompanyId, inputs, generated, customSections, getAccessToken]);

  // Auto-save on data changes
  useEffect(() => {
    if (activeCompany && !loading) {
      const timer = setTimeout(() => saveCurrentCompany(), 1000); // Debounce
      return () => clearTimeout(timer);
    }
  }, [inputs, generated, customSections, activeCompany, loading]);

  // Create a new company
  const createCompany = useCallback(async (name) => {
    const trimmedName = name.trim();
    if (!trimmedName || companies.includes(trimmedName)) {
      return { success: false, error: 'Invalid or duplicate name' };
    }

    try {
      if (useCloudStorage) {
        // Check if user can create (credit check)
        const canCreate = await checkCanCreate();

        if (!canCreate.allowed) {
          return {
            success: false,
            error: canCreate.reason || 'No credits available',
            needsUpgrade: true,
          };
        }

        // Create via API
        const token = await getAccessToken();
        const res = await fetch(`${API_URL}/api/company-preps`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            company_name: trimmedName,
            inputs: { ...EMPTY_INPUTS },
            generated: { ...EMPTY_GENERATED },
            custom_sections: [],
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          if (data.code === 'INSUFFICIENT_CREDITS') {
            return { success: false, error: data.error, needsUpgrade: true };
          }
          throw new Error(data.error || 'Failed to create company');
        }

        const { prep, credit_used, was_free } = await res.json();

        // Refresh user data to update credit balance
        await refreshUserData();

        // Update local state
        setCompanies(prev => [...prev, trimmedName]);
        setActiveCompany(trimmedName);
        setActiveCompanyId(prep.id);
        setInputs({ ...EMPTY_INPUTS });
        setGenerated({ ...EMPTY_GENERATED });
        setCustomSections([]);

        return { success: true, creditUsed: credit_used, wasFree: was_free };
      } else {
        // Create in localStorage
        const stored = localStorage.getItem('interviewPrepCompanies');
        const data = stored ? JSON.parse(stored) : { companies: [], activeCompany: null, data: {} };

        data.companies.push(trimmedName);
        data.activeCompany = trimmedName;
        data.data[trimmedName] = {
          inputs: { ...EMPTY_INPUTS },
          generated: { ...EMPTY_GENERATED },
          customSections: [],
        };

        localStorage.setItem('interviewPrepCompanies', JSON.stringify(data));

        setCompanies(data.companies);
        setActiveCompany(trimmedName);
        setInputs({ ...EMPTY_INPUTS });
        setGenerated({ ...EMPTY_GENERATED });
        setCustomSections([]);

        return { success: true };
      }
    } catch (err) {
      console.error('Create company error:', err);
      return { success: false, error: err.message };
    }
  }, [useCloudStorage, companies, checkCanCreate, getAccessToken, refreshUserData]);

  // Switch to a different company
  const switchCompany = useCallback(async (companyName) => {
    if (companyName === activeCompany) return;

    // Save current before switching
    await saveCurrentCompany();

    try {
      if (useCloudStorage) {
        // Load from API
        const token = await getAccessToken();
        const res = await fetch(`${API_URL}/api/company-preps`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to load company preps');

        const { preps } = await res.json();
        const prep = preps.find(p => p.company_name === companyName);

        if (prep) {
          setActiveCompany(companyName);
          setActiveCompanyId(prep.id);
          setInputs(prep.inputs || { ...EMPTY_INPUTS });
          setGenerated(prep.generated || { ...EMPTY_GENERATED });
          setCustomSections(prep.custom_sections || []);
        }
      } else {
        // Load from localStorage
        const stored = localStorage.getItem('interviewPrepCompanies');
        if (stored) {
          const data = JSON.parse(stored);
          data.activeCompany = companyName;
          localStorage.setItem('interviewPrepCompanies', JSON.stringify(data));

          if (data.data[companyName]) {
            setActiveCompany(companyName);
            setInputs(data.data[companyName].inputs || { ...EMPTY_INPUTS });
            setGenerated(data.data[companyName].generated || { ...EMPTY_GENERATED });
            setCustomSections(data.data[companyName].customSections || []);
          }
        }
      }
    } catch (err) {
      console.error('Switch company error:', err);
    }
  }, [useCloudStorage, activeCompany, saveCurrentCompany, getAccessToken]);

  // Rename company
  const renameCompany = useCallback(async (newName) => {
    const trimmedName = newName.trim();
    if (!trimmedName || trimmedName === activeCompany) return { success: false };
    if (companies.includes(trimmedName)) return { success: false, error: 'Name already exists' };

    try {
      if (useCloudStorage && activeCompanyId) {
        const token = await getAccessToken();
        await fetch(`${API_URL}/api/company-preps/${activeCompanyId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ company_name: trimmedName }),
        });
      } else {
        const stored = localStorage.getItem('interviewPrepCompanies');
        if (stored) {
          const data = JSON.parse(stored);
          const index = data.companies.indexOf(activeCompany);
          if (index !== -1) {
            data.companies[index] = trimmedName;
            data.data[trimmedName] = data.data[activeCompany];
            delete data.data[activeCompany];
            data.activeCompany = trimmedName;
            localStorage.setItem('interviewPrepCompanies', JSON.stringify(data));
          }
        }
      }

      setCompanies(prev => prev.map(c => c === activeCompany ? trimmedName : c));
      setActiveCompany(trimmedName);
      return { success: true };
    } catch (err) {
      console.error('Rename company error:', err);
      return { success: false, error: err.message };
    }
  }, [useCloudStorage, activeCompany, activeCompanyId, companies, getAccessToken]);

  // Delete company
  const deleteCompany = useCallback(async (companyName) => {
    try {
      if (useCloudStorage) {
        // Find the prep ID
        const token = await getAccessToken();
        const res = await fetch(`${API_URL}/api/company-preps`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
          const { preps } = await res.json();
          const prep = preps.find(p => p.company_name === companyName);

          if (prep) {
            await fetch(`${API_URL}/api/company-preps/${prep.id}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` },
            });
          }
        }
      } else {
        const stored = localStorage.getItem('interviewPrepCompanies');
        if (stored) {
          const data = JSON.parse(stored);
          data.companies = data.companies.filter(c => c !== companyName);
          delete data.data[companyName];

          if (data.companies.length > 0) {
            data.activeCompany = data.companies[0];
          } else {
            data.activeCompany = null;
          }
          localStorage.setItem('interviewPrepCompanies', JSON.stringify(data));
        }
      }

      // Update local state
      const newCompanies = companies.filter(c => c !== companyName);
      setCompanies(newCompanies);

      if (companyName === activeCompany) {
        if (newCompanies.length > 0) {
          await switchCompany(newCompanies[0]);
        } else {
          setActiveCompany(null);
          setActiveCompanyId(null);
          setInputs({ ...EMPTY_INPUTS });
          setGenerated({ ...EMPTY_GENERATED });
          setCustomSections([]);
        }
      }

      return { success: true };
    } catch (err) {
      console.error('Delete company error:', err);
      return { success: false, error: err.message };
    }
  }, [useCloudStorage, companies, activeCompany, switchCompany, getAccessToken]);

  // Update inputs
  const updateInputs = useCallback((field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  }, []);

  // Update generated content
  const updateGenerated = useCallback((sectionId, content) => {
    setGenerated(prev => ({ ...prev, [sectionId]: content }));
  }, []);

  // Clear all generated content
  const clearGenerated = useCallback(() => {
    setGenerated({ ...EMPTY_GENERATED });
  }, []);

  // Add custom section
  const addCustomSection = useCallback((section) => {
    setCustomSections(prev => [...prev, section]);
  }, []);

  // Remove custom section
  const removeCustomSection = useCallback((sectionId) => {
    setCustomSections(prev => prev.filter(s => s.id !== sectionId));
    setGenerated(prev => {
      const newGenerated = { ...prev };
      delete newGenerated[sectionId];
      return newGenerated;
    });
  }, []);

  // Get auth headers for API calls
  const getAuthHeaders = useCallback(async () => {
    if (useCloudStorage) {
      const token = await getAccessToken();
      return token ? { Authorization: `Bearer ${token}` } : {};
    }
    const token = localStorage.getItem('ascend_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [useCloudStorage, getAccessToken]);

  return {
    // State
    companies,
    activeCompany,
    inputs,
    generated,
    customSections,
    loading,
    error,
    useCloudStorage,

    // Actions
    loadData,
    createCompany,
    switchCompany,
    renameCompany,
    deleteCompany,
    updateInputs,
    updateGenerated,
    clearGenerated,
    addCustomSection,
    removeCustomSection,
    getAuthHeaders,
    saveCurrentCompany,
  };
}

export default useCompanyPreps;
