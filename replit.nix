{ pkgs }: {
    deps = [
        pkgs.sudo
        pkgs.yarn
        pkgs.esbuild
        pkgs.nodejs-16_x

        pkgs.nodePackages.typescript
        pkgs.nodePackages.pnpm
        pkgs.nodePackages.typescript-language-server
    ];
}