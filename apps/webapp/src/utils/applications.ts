import type { Cookie } from "@builder.io/qwik-city";
import {
  applicationSchema,
  applicationSettingsSchema,
} from "~/model/applications";
import type { ApplicationSchema } from "~/model/applications";
import { callApi } from "./fetch";

interface Application {
  name: string;
}

export const createApplication = async (
  { name }: Application,
  cookie: Cookie,
  baseUrl: string
): Promise<any | null> => {
  try {
    const data: any = await callApi(
      {
        endpoint: "/applications",
        method: "POST",
        body: {
          name,
        },
      },
      baseUrl,
      cookie
    );
    return data;
  } catch (e: any) {
    console.log(e);
    return null;
  }
};

export const updateApplicationProviderById = async (
  providers: any,
  id: string,
  cookie: Cookie,
  baseUrl: string
): Promise<any | null> => {
  try {
    const data: any = await callApi(
      {
        endpoint: `/applications/${id}/providers`,
        method: "POST",
        body: providers,
      },
      baseUrl,
      cookie
    );
    return data;
  } catch (e: any) {
    console.log(e);
    return null;
  }
};

export const updateApplicationById = async (
  updates: any,
  id: string,
  cookie: Cookie,
  baseUrl: string
): Promise<any | null> => {
  try {
    const keys = Object.keys(
      applicationSettingsSchema.shape
    ) as (keyof typeof applicationSettingsSchema.shape)[];

    const applicationSettings: {
      [key in keyof typeof applicationSettingsSchema.shape]?: any;
    } = {};

    for (const key of keys) {
      if (
        !Object.prototype.hasOwnProperty.call(applicationSettingsSchema, key)
      ) {
        applicationSettings[key] = updates[key];
      }
    }

    const data: ApplicationSchema = applicationSchema.parse({
      ...updates,
      settings: applicationSettings,
    });

    const results: any = await callApi(
      {
        endpoint: `/applications/${id}`,
        method: "POST",
        body: data,
      },
      baseUrl,
      cookie
    );

    return results;
  } catch (e: any) {
    console.log(e);
    return null;
  }
};

export const getAllApplicationForListingByUser = async (
  cookie: Cookie,
  baseUrl: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications`,
      method: "GET",
    },
    baseUrl,
    cookie
  );
  return data;
};

export const getAllApplicationsById = async (
  cookie: Cookie,
  baseUrl: string,
  id: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}`,
      method: "GET",
    },
    baseUrl,
    cookie
  );
  return data;
};

export const getAllApplicationsProvidersById = async (
  cookie: Cookie,
  baseUrl: string,
  id: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}/providers`,
      method: "GET",
    },
    baseUrl,
    cookie
  );
  return data;
};
