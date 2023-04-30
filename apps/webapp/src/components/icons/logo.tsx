import { component$ } from "@builder.io/qwik";

type Props = {
  className?: string;
};

export const AuthC1Icon = component$(({ className }: Props) => {
  return (
    <svg
      width={877}
      height={805}
      viewBox="0 0 877 805"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class={className}
    >
      <g clipPath="url(#clip0_503_162)">
        <path
          d="M742 543.43H760.9C759.72 546.41 758.503 549.383 757.25 552.35C722.676 634.088 660.903 701.356 582.4 742.753C503.898 784.151 413.496 797.13 326.517 779.491C239.539 761.852 161.335 714.681 105.161 645.972C48.9874 577.263 18.2998 491.244 18.2998 402.495C18.2998 313.746 48.9874 227.727 105.161 159.018C161.335 90.3093 239.539 43.1378 326.517 25.499C413.496 7.86027 503.898 20.8395 582.4 62.2367C660.903 103.634 722.676 170.902 757.25 252.64C758.503 255.6 759.72 258.573 760.9 261.56H742C741.72 260.86 741.43 260.16 741.13 259.46C708.13 181.438 649.165 117.226 574.232 77.7099C499.299 38.1935 413.007 25.8033 329.982 42.6394C246.958 59.4755 172.309 104.502 118.688 170.087C65.068 235.672 35.7753 317.781 35.7753 402.495C35.7753 487.209 65.068 569.318 118.688 634.903C172.309 700.488 246.958 745.515 329.982 762.351C413.007 779.187 499.299 766.797 574.232 727.28C649.165 687.764 708.13 623.552 741.13 545.53C741.43 544.843 741.72 544.143 742 543.43Z"
          fill="white"
        />
        <path
          d="M742 543.43C741.72 544.13 741.43 544.83 741.13 545.53C708.129 623.552 649.165 687.764 574.232 727.28C499.299 766.797 413.006 779.187 329.982 762.351C246.957 745.515 172.308 700.488 118.688 634.903C65.0677 569.318 35.775 487.209 35.775 402.495C35.775 317.781 65.0677 235.672 118.688 170.087C172.308 104.502 246.957 59.4755 329.982 42.6394C413.006 25.8033 499.299 38.1935 574.232 77.7099C649.165 117.226 708.129 181.438 741.13 259.46C741.43 260.16 741.72 260.86 742 261.56H779.63C722.5 108.78 575.21 0 402.5 0C179.96 0 -0.410279 180.62 -0.000278966 403.27C0.409721 625.69 182.58 806.35 405 805C576.63 804 722.79 695.49 779.63 543.43H742Z"
          fill="#6c63ff"
        />
        <path
          d="M202.77 438.8H138.77L126.6 475.28H87.8496L153.76 298.22H187.57L253.85 475.28H215.05L202.77 438.8ZM148.66 409.25H192.92L170.67 342.97L148.66 409.25Z"
          fill="#6c63ff"
        />
        <path
          d="M345.5 461.91C336.833 472.45 324.833 477.72 309.5 477.72C295.4 477.72 284.64 473.663 277.22 465.55C269.8 457.437 266.01 445.56 265.85 429.92V343.7H300.99V428.81C300.99 442.523 307.233 449.38 319.72 449.38C331.64 449.38 339.826 445.24 344.28 436.96V343.7H379.55V475.28H346.5L345.5 461.91Z"
          fill="#6c63ff"
        />
        <path
          d="M448.18 311.35V343.7H470.68V369.5H448.18V435.17C448.18 440.037 449.114 443.523 450.98 445.63C452.847 447.737 456.414 448.79 461.68 448.79C465.146 448.827 468.607 448.543 472.02 447.94V474.57C465.121 476.682 457.945 477.75 450.73 477.74C426.064 477.74 413.497 465.293 413.03 440.4V369.5H393.82V343.7H413.03V311.35H448.18Z"
          fill="#6c63ff"
        />
        <path
          d="M524.55 358.05C533.884 346.857 545.597 341.263 559.69 341.27C588.23 341.27 602.704 357.85 603.11 391.01V475.28H567.96V391.98C567.96 384.44 566.34 378.867 563.1 375.26C559.86 371.653 554.47 369.85 546.93 369.85C536.63 369.85 529.17 373.823 524.55 381.77V475.28H489.4V288.5H524.55V358.05Z"
          fill="#6c63ff"
        />
        <path
          d="M770.93 416.3C769.55 435.36 762.517 450.36 749.83 461.3C737.144 472.24 720.424 477.713 699.67 477.72C677.004 477.72 659.147 470.077 646.1 454.79C633.053 439.503 626.547 418.527 626.58 391.86V381.04C626.58 364.013 629.58 349.013 635.58 336.04C641.58 323.067 650.154 313.117 661.3 306.19C672.454 299.25 685.404 295.783 700.15 295.79C720.584 295.79 737.044 301.26 749.53 312.2C762.017 323.14 769.23 338.503 771.17 358.29H734.69C733.797 346.857 730.614 338.57 725.14 333.43C719.667 328.29 711.334 325.713 700.14 325.7C687.98 325.7 678.88 330.06 672.84 338.78C666.8 347.5 663.7 361.017 663.54 379.33V392.71C663.54 411.85 666.437 425.85 672.23 434.71C678.024 443.57 687.167 447.987 699.66 447.96C710.933 447.96 719.344 445.387 724.89 440.24C730.437 435.093 733.64 427.113 734.5 416.3H770.93Z"
          fill="#6c63ff"
        />
        <path
          d="M876.5 475.28H841.34V339.81L799.34 352.81V324.24L872.67 297.98H876.5V475.28Z"
          fill="#6c63ff"
        />
      </g>
      <defs>
        <clipPath id="clip0_503_162">
          <rect width={876.49} height={805} fill="white" />
        </clipPath>
      </defs>
      <circle r="20" fill="red">
        <animateMotion
          dur="10s"
          repeatCount="indefinite"
          path="M742 543.43C741.72 544.13 741.43 544.83 741.13 545.53C708.129 623.552 649.165 687.764 574.232 727.28C499.299 766.797 413.006 779.187 329.982 762.351C246.957 745.515 172.308 700.488 118.688 634.903C65.0677 569.318 35.775 487.209 35.775 402.495C35.775 317.781 65.0677 235.672 118.688 170.087C172.308 104.502 246.957 59.4755 329.982 42.6394C413.006 25.8033 499.299 38.1935 574.232 77.7099C649.165 117.226 708.129 181.438 741.13 259.46C741.43 260.16 741.72 260.86 742 261.56H779.63C722.5 108.78 575.21 0 402.5 0C179.96 0 -0.410279 180.62 -0.000278966 403.27C0.409721 625.69 182.58 806.35 405 805C576.63 804 722.79 695.49 779.63 543.43H742Z"
        />
      </circle>
    </svg>
  );
});
