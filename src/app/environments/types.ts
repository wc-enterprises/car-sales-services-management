export interface EnvInterface extends Record<string, any> {
  environment: "local" | "demo" | "prod";
  theme: string;
  navBarTheme: string[];
  logoUrl: string;
}
