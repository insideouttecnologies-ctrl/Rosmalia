import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
  signOut,
} from 'firebase/auth';
import { app, auth } from './firebase';

const provider = new GoogleAuthProvider();

// Scopes for Google Drive requested by user
export const DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.activity',
  'https://www.googleapis.com/auth/drive.activity.readonly',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.apps.readonly',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.install',
  'https://www.googleapis.com/auth/drive.meet.readonly',
  'https://www.googleapis.com/auth/drive.metadata',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
  'https://www.googleapis.com/auth/drive.photos.readonly',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/drive.scripts',
];

DRIVE_SCOPES.forEach((scope) => provider.addScope(scope));

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveMediaFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
  directUrl: string;
  size?: string;
  createdTime?: string;
}

export const initDriveAuth = (
  onAuthSuccess?: (user: FirebaseUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: FirebaseUser | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Token might have expired or needs refresh
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const normalizeDriveImageUrl = (urlOrId: string): string => {
  if (!urlOrId || typeof urlOrId !== 'string') return '';
  const trimmed = urlOrId.trim();

  // If already a high-performance lh3 googleusercontent link
  if (trimmed.includes('lh3.googleusercontent.com/d/')) return trimmed;

  // Pattern 1: https://drive.google.com/file/d/{FILE_ID}/...
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileDMatch && fileDMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
  }

  // Pattern 2: https://drive.google.com/open?id={FILE_ID} or ?id={FILE_ID}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${idParamMatch[1]}`;
  }

  // Pattern 3: https://drive.google.com/uc?export=view&id={FILE_ID}
  const ucMatch = trimmed.match(/\/uc\?.*id=([a-zA-Z0-9_-]+)/);
  if (ucMatch && ucMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`;
  }

  // Pattern 4: Bare Drive file ID (alphanumeric with hyphens/underscores, usually ~28-44 chars)
  if (/^[a-zA-Z0-9_-]{25,50}$/.test(trimmed)) {
    return `https://lh3.googleusercontent.com/d/${trimmed}`;
  }

  return trimmed;
};

export const setManualDriveAccessToken = (token: string) => {
  cachedAccessToken = token;
  if (typeof window !== 'undefined') {
    localStorage.setItem('lume_drive_manual_token', token);
  }
};

export const signInWithGoogleDrive = async (): Promise<{
  user: FirebaseUser;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Falha ao obter token de acesso Google Drive');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Erro na autenticação Google Drive:', error);
    if (error.code === 'auth/unauthorized-domain') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'o teu domínio Render';
      throw new Error(
        `Domínio Render não autorizado (${hostname})! Adicione "${hostname}" em Firebase Console > Authentication > Settings > Authorized Domains para ativar o popup da Google no Render.`
      );
    }
    if (error.code === 'auth/popup-blocked') {
      throw new Error('A janela pop-up do Google foi bloqueada pelo navegador. Permita pop-ups para este site.');
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getDriveAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const disconnectGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// ---------------- Google Drive API Helpers ---------------- //

/**
 * Find or create a folder by name in Google Drive
 */
export const findOrCreateFolder = async (
  folderName: string,
  parentId?: string
): Promise<string> => {
  const token = await getDriveAccessToken();
  if (!token) throw new Error('Não autenticado no Google Drive. Conecta a tua conta primeiro.');

  // Check if folder exists
  let query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`;
  if (parentId) {
    query += ` and '${parentId}' in parents`;
  }

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (!searchRes.ok) {
    throw new Error(`Erro ao pesquisar pasta no Google Drive: ${searchRes.statusText}`);
  }

  const searchData = await searchRes.json();
  if (searchData.files && searchData.files.length > 0) {
    return searchData.files[0].id;
  }

  // Create folder if not found
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    }),
  });

  if (!createRes.ok) {
    throw new Error(`Erro ao criar pasta no Google Drive: ${createRes.statusText}`);
  }

  const createData = await createRes.json();
  return createData.id;
};

/**
 * Initializes dedicated folder structure in user's Google Drive:
 * Lume Blog Media/
 *   ├── Profile Pictures/
 *   ├── Post Media (Images, Audio, Video)/
 *   └── Gallery Photos/
 */
export const initializeLumeDriveFolders = async (): Promise<{
  rootFolderId: string;
  profilePicturesFolderId: string;
  postMediaFolderId: string;
  galleryFolderId: string;
}> => {
  // 1. Root Folder
  const rootFolderId = await findOrCreateFolder('Lume Blog Media');

  // 2. Subfolders
  const profilePicturesFolderId = await findOrCreateFolder('Profile Pictures', rootFolderId);
  const postMediaFolderId = await findOrCreateFolder('Post Media', rootFolderId);
  const galleryFolderId = await findOrCreateFolder('Gallery Photos', rootFolderId);

  return {
    rootFolderId,
    profilePicturesFolderId,
    postMediaFolderId,
    galleryFolderId,
  };
};

/**
 * Makes file publicly readable so it can be displayed/played in the blog
 */
export const setFilePublicReadable = async (fileId: string): Promise<void> => {
  const token = await getDriveAccessToken();
  if (!token) return;

  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (err) {
    console.warn('Erro ao definir permissão pública do ficheiro:', err);
  }
};

/**
 * Upload a media file (Image, Audio, Video) to a specific Google Drive folder
 */
export const uploadFileToDrive = async (
  file: File,
  folderType: 'profiles' | 'posts' | 'gallery',
  onProgress?: (percentage: number) => void
): Promise<DriveMediaFile> => {
  const token = await getDriveAccessToken();
  if (!token) throw new Error('Inicia sessão com a conta Google para fazer upload para o Google Drive.');

  // Get target folder
  const folders = await initializeLumeDriveFolders();
  let targetFolderId = folders.postMediaFolderId;
  if (folderType === 'profiles') targetFolderId = folders.profilePicturesFolderId;
  if (folderType === 'gallery') targetFolderId = folders.galleryFolderId;

  // Metadata
  const metadata = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    parents: [targetFolderId],
  };

  const form = new FormData();
  form.append(
    'metadata',
    new Blob([JSON.stringify(metadata)], { type: 'application/json' })
  );
  form.append('file', file);

  if (onProgress) onProgress(30);

  const res = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: form,
    }
  );

  if (onProgress) onProgress(80);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Falha no upload para o Google Drive: ${errorText}`);
  }

  const data = await res.json();

  // Make public reader so images, audio and videos stream in the app
  await setFilePublicReadable(data.id);

  if (onProgress) onProgress(100);

  // Standard direct URL for display and streaming
  const directUrl = `https://lh3.googleusercontent.com/d/${data.id}`;

  return {
    id: data.id,
    name: data.name,
    mimeType: data.mimeType,
    webViewLink: data.webViewLink,
    webContentLink: data.webContentLink,
    thumbnailLink: data.thumbnailLink,
    directUrl,
    size: data.size,
    createdTime: data.createdTime,
  };
};

/**
 * List files in the Lume media folders
 */
export const listDriveMediaFiles = async (
  folderType?: 'profiles' | 'posts' | 'gallery'
): Promise<DriveMediaFile[]> => {
  const token = await getDriveAccessToken();
  if (!token) return [];

  try {
    const folders = await initializeLumeDriveFolders();
    let folderId = folders.rootFolderId;
    if (folderType === 'profiles') folderId = folders.profilePicturesFolderId;
    if (folderType === 'posts') folderId = folders.postMediaFolderId;
    if (folderType === 'gallery') folderId = folders.galleryFolderId;

    const q = `'${folderId}' in parents and trashed=false`;
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        q
      )}&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink,size,createdTime)&orderBy=createdTime desc&pageSize=50`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) return [];
    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      ...f,
      directUrl: `https://lh3.googleusercontent.com/d/${f.id}`,
    }));
  } catch (err) {
    console.error('Erro ao listar ficheiros do Drive:', err);
    return [];
  }
};

/**
 * Delete a file with mandatory confirmation requirement
 */
export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = await getDriveAccessToken();
  if (!token) throw new Error('Não autenticado');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.ok;
};
