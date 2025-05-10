import { lightOrange, lightPurple, orange } from "@/app/constants/color";
import { getLast7Days } from "@/lib/features";
import { purple } from "@mui/material/colors";
import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import React from "react";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  Tooltip,
  LinearScale,
  LineElement,
  PointElement,
  Filler,
  ArcElement,
  Legend
);

const LineChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
    },
    y: {
      beginAtZero: true,
      grid: {
        display: false,
      },
    },
  },
};

const labels = getLast7Days();

const LineChart = ({ value = [] }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        data: value,
        label: "Messages",
        fill: true,
        backgroundColor: lightPurple,
        borderColor: purple[500],
      },
    ],
  };

  return <Line data={data} options={LineChartOptions} />;
};

const DoughnutChartOptions = {
  responsive: true,
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
  cutout: 80,
};

const DoughnutChart = ({ value = [], labels = [] }) => {
  const data = {
    labels: labels,
    datasets: [
      {
        data: value,
        fill: true,
        borderColor: [purple[500], orange[500]],
        hoverBackgroundColor: [purple[500], orange[500]],
        backgroundColor: [lightPurple, lightOrange],
        offset: 40,
      },
    ],
  };

  return (
    <Doughnut
      data={data}
      options={DoughnutChartOptions}
      style={{ zIndex: 1 }}
    />
  );
};

export { DoughnutChart, LineChart };
