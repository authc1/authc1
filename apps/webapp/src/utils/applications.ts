import type { Cookie } from "@builder.io/qwik-city";
import { callApi } from "./fetch";

interface Application {
  name: string;
}

export const createApplication = async (
  { name }: Application,
  cookie: Cookie,
  appId: string,
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
      appId,
      baseUrl,
      cookie
    );
    return data;
  } catch (e: any) {
    console.log(e);
    return null;
  }
};

export const createApplicationWebhook = async (
  webhookEndpoint: any,
  id: string,
  cookie: Cookie,
  appId: string,
  baseUrl: string
): Promise<any | null> => {
  try {
    const data: any = await callApi(
      {
        endpoint: `/applications/${id}/webhooks`,
        method: "POST",
        body: webhookEndpoint,
      },
      appId,
      baseUrl,
      cookie
    );
    return data;
  } catch (e: any) {
    console.log(e);
    return null;
  }
};

export const createApplicationApikey = async (
  apiKeyData: any,
  id: string,
  cookie: Cookie,
  appId: string,
  baseUrl: string
): Promise<any | null> => {
  try {
    const data: any = await callApi(
      {
        endpoint: `/applications/${id}/apikeys`,
        method: "POST",
        body: apiKeyData,
      },
      appId,
      baseUrl,
      cookie
    );
    return data;
  } catch (e: any) {
    console.log(e);
    return null;
  }
};

export const getAllApplicationWebhooks = async (
  cookie: Cookie,
  appId: string,
  baseUrl: string,
  id: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}/webhooks`,
      method: "GET",
    },
    appId,
    baseUrl,
    cookie
  );
  return data;
};

export const getAllApplicationApikeys = async (
  cookie: Cookie,
  appId: string,
  baseUrl: string,
  id: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}/apikeys`,
      method: "GET",
    },
    appId,
    baseUrl,
    cookie
  );
  return data;
};

export const getWebhookDetailsById = async (
  cookie: Cookie,
  appId: string,
  baseUrl: string,
  id: string,
  webhookId: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}/webhooks/${webhookId}`,
      method: "GET",
    },
    appId,
    baseUrl,
    cookie
  );
  return data;
};

export const getApiKeyDetailsById = async (
  cookie: Cookie,
  appId: string,
  baseUrl: string,
  id: string,
  apiKeyId: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}/apikeys/${apiKeyId}`,
      method: "GET",
    },
    appId,
    baseUrl,
    cookie
  );
  return data;
};

export const deleteWebhookById = async (
  cookie: Cookie,
  appId: string,
  baseUrl: string,
  id: string,
  webhookId: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}/webhooks/${webhookId}`,
      method: "DELETE",
    },
    appId,
    baseUrl,
    cookie
  );
  return data;
};

export const updateWebhookById = async (
  cookie: Cookie,
  appId: string,
  baseUrl: string,
  id: string,
  webhookId: string,
  updates: any
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}/webhooks/${webhookId}`,
      method: "PATCH",
      body: updates,
    },
    appId,
    baseUrl,
    cookie
  );
  return data;
};

export const updateApplicationProviderById = async (
  providers: any,
  id: string,
  cookie: Cookie,
  appId: string,
  baseUrl: string
): Promise<any | null> => {
  try {
    const data: any = await callApi(
      {
        endpoint: `/applications/${id}/providers`,
        method: "POST",
        body: providers,
      },
      appId,
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
  appId: string,
  baseUrl: string
): Promise<any | null> => {
  try {
    const results: any = await callApi(
      {
        endpoint: `/applications/${id}`,
        method: "POST",
        body: updates,
      },
      appId,
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
  appId: string,
  baseUrl: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications`,
      method: "GET",
    },
    appId,
    baseUrl,
    cookie
  );
  return data;
};

export const getAllApplicationsById = async (
  cookie: Cookie,
  appId: string,
  baseUrl: string,
  id: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}`,
      method: "GET",
    },
    appId,
    baseUrl,
    cookie
  );
  return data;
};

export const getAllApplicationsProvidersById = async (
  cookie: Cookie,
  appId: string,
  baseUrl: string,
  id: string
): Promise<any> => {
  const data: any = await callApi(
    {
      endpoint: `/applications/${id}/providers`,
      method: "GET",
    },
    appId,
    baseUrl,
    cookie
  );
  return data;
};
