export const TypeScriptPrimitiveTypes = ["bigint", "boolean", "function", "number", "object", "string", "symbol", "undefined"] as const;

export type ReadOnly<T> = {
    readonly [P in keyof T] : T[P]
}


export type ProductType = {
    _id: string,
    id: string,
    name: string,
    images: string[],
    isAvailable: boolean,
    quantity: number,
    url: string,
    priceToShow: number,
    price: number,
    category: string,
    vendor: string,
    description: string,
    articleNumber: string,
    params: {
        name: string,
        value: string
    }[],
    isFetched: boolean,
    likedBy: string[],
    addedToCart: Date[],
    orderedBy: string[]
}

export type CategoryType = {
    _id: string,
    name: string,
    products: string[],
    totalValue: number
}

export type Category = {
    category: { 
        name: string, 
        _id: string
    },
    values: {
      totalProducts: number,
      totalValue: number,
      averageProductPrice: number,
      stringifiedProducts: string
    }
}

export enum EventNames {
    PageView = "pageView",
    ViewContent = "viewContent",
    AddToCart = "addToCart",
    AddToWishlist = "addToWishlist",
    InitiateCheckout = "initiateCheckout",
    AddPaymentInfo = "addPaymentInfo",
    Purchase = "purchase",
    Search = "search",
    Lead = "lead",
    CompleteRegistration = "completeRegistration",
}

export type PixelEvents = {
    [key in EventNames]: boolean;
};

export type PixelData = {
    _id: string;
    name: string;
    id: string;
    status: "Active" | "Deactivated";
    type: "Meta" | "TikTok";
    createdAt: string;
    activatedAt: string | null;
    deactivatedAt: string | null;
    events: PixelEvents;
};

export type Connection = {
    start: string;
    end: string;
    color: string;
}

type ConfigPathValue = {
    value: string,
    attributeOf?: string
}
export type Config = {
    cards: Record<string, string>
    paths: {
        Categories: {
            category_id: ConfigPathValue,
            name: ConfigPathValue,
            reference_by: ConfigPathValue
        },
        Products: {
            article_number: ConfigPathValue,
            name: ConfigPathValue,
            price: ConfigPathValue,
            discount_price: ConfigPathValue,
            images: ConfigPathValue,
            available: ConfigPathValue,
            category: ConfigPathValue,
            description: ConfigPathValue,
            quantity: ConfigPathValue,
            url: ConfigPathValue,
            vendor: ConfigPathValue,
            params: ConfigPathValue,
        },
        Params: {
            name: ConfigPathValue,
            value: ConfigPathValue
        },
        Start: {
            categories: ConfigPathValue,
            products: ConfigPathValue,
        }
    }
}

export type CreateUrlParams = {
    _id?: string,
    id: string | null,
    name: string | null,
    isAvailable: boolean,
    quantity: number,
    url: string | null,
    priceToShow: number,
    price: number,
    images: (string | null)[],
    vendor: string | null,
    description: string | null,
    articleNumber: string | null,
    params: {
        name: string | null,
        value: string | null
    }[],
    isFetched: boolean
    category:string
}

export interface OrderRef {
    order: string;
    createdAt: Date;
}
  
export interface UserType {
    _id: string;
    username?: string;
    name?: string;
    surname?: string;
    email: string;
    phoneNumber?: string;
    password: string;
    orders: OrderRef[];
    totalOrders: number;
    favourite: string[];
    discounts: string[];
    role: "User" | "Admin" | "Owner";
    selfCreated: boolean;
    region?: string;
    city?: string;
    postalCode?: string;
    street?: string;
    isVerified: boolean;
    forgotPasswordToken?: string;
    forgotPasswordTokenExpiry?: Date;
    verifyToken?: string;
    verifyTokenExpiry?: Date;
    likes: string[];
    githubId?: string
    githubUsername?: string ,
    githubProfileUrl?: string ,
    githubEmail?: string ,
    githubAccessToken?: string ,
}

type Param = {
  name: string;
  totalProducts: number;
  type: string;
};

type CategoryData = {
  name: string;
  totalProducts: number;
  params: Record<string, Param>;
};

export type CreateFilterProps = Record<string, {
    categoryName: string;
    totalProducts: number;
    params: Record<string, Param>;
  }>;

// Output Data Types

type FilterCategory = {
  categoryId: string;
  params: Param[];
};

export type FilterType = {
    _id: string,
    categories: FilterCategory[],
    delay: number
}

interface ParamType {
  name: string
  totalProducts: number
  type: string
}

interface CategoryDataParams {
  name: string
  totalProducts: number
  params: ParamType[]
}

export type CategoriesParams =  {
  [key: string]: CategoryDataParams
}

export type Product = {
    _id: string;
    name: string;
    description: string;
    category: string;
    images: string[];
    price: number;
    priceToShow: number;
    params: Array<{ name: string; value: string }>;
};

export type FilterSettingsParamsType = {
    totalProducts: number;
    type: string;
};

export type FilterSettingsData = {
    [categoryId: string]: {
        params: { [paramName: string]: FilterSettingsParamsType };
        totalProducts: number;
    };
};