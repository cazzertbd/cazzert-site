interface CloudinaryConfig {
  cloudName: string;
  apiKey: string;
}

interface CloudinaryUploadResponse {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

interface UploadOptions {
  folder?: string;
  publicId?: string;
  transformation?: any[];
}

export class CloudinaryClient {
  private config: CloudinaryConfig;

  constructor(config: CloudinaryConfig) {
    this.config = config;
  }

  /**
   * Upload image to Cloudinary using unsigned upload
   */
  async uploadImage(
    file: File | string, // File object or base64 string
    options: UploadOptions = {},
  ): Promise<CloudinaryUploadResponse> {
    const formData = new FormData();

    // Use unsigned upload preset (you'll need to create this in Cloudinary)
    formData.append("upload_preset", "cazzert_products"); // Create this preset in Cloudinary
    formData.append("cloud_name", this.config.cloudName);

    if (typeof file === "string") {
      // Handle base64 string
      formData.append("file", file);
    } else {
      // Handle File object
      formData.append("file", file);
    }

    if (options.folder) {
      formData.append("folder", options.folder);
    }

    if (options.publicId) {
      formData.append("public_id", options.publicId);
    }

    if (options.transformation) {
      formData.append("transformation", JSON.stringify(options.transformation));
    }

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.config.cloudName}/image/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Upload failed");
      }

      return await response.json();
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      throw new Error("Failed to upload image");
    }
  }

  /**
   * Upload multiple images
   */
  async uploadImages(
    files: (File | string)[],
    options: UploadOptions = {},
  ): Promise<CloudinaryUploadResponse[]> {
    const uploadPromises = files.map((file, index) => {
      const fileOptions = {
        ...options,
        publicId: options.publicId ? `${options.publicId}_${index}` : undefined,
      };
      return this.uploadImage(file, fileOptions);
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Delete image from Cloudinary
   */
  async deleteImage(publicId: string): Promise<void> {
    // Note: This requires a signed request with API secret
    // For security, this should be done server-side
    // We'll create an API endpoint for this
    try {
      const response = await fetch("/api/cloudinary/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete image");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      throw error;
    }
  }

  /**
   * Generate optimized image URL
   */
  generateImageUrl(
    publicId: string,
    transformations: Record<string, any> = {},
  ): string {
    const baseUrl = `https://res.cloudinary.com/${this.config.cloudName}/image/upload`;

    if (Object.keys(transformations).length === 0) {
      return `${baseUrl}/${publicId}`;
    }

    const transformString = Object.entries(transformations)
      .map(([key, value]) => `${key}_${value}`)
      .join(",");

    return `${baseUrl}/${transformString}/${publicId}`;
  }
}

// Helper to create cloudinary instance
export const createCloudinaryClient = (config: CloudinaryConfig) => {
  return new CloudinaryClient(config);
};
