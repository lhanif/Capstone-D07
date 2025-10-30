/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file           : main.c
  * @brief          : Main program body
  ******************************************************************************
  * @attention
  *
  * Copyright (c) 2025 STMicroelectronics.
  * All rights reserved.
  *
  * This software is licensed under terms that can be found in the LICENSE file
  * in the root directory of this software component.
  * If no LICENSE file comes with this software, it is provided AS-IS.
  *
  ******************************************************************************
  */
/* USER CODE END Header */
/* Includes ------------------------------------------------------------------*/
#include "main.h"

/* Private includes ----------------------------------------------------------*/
/* USER CODE BEGIN Includes */
#include "stdio.h"
#include "string.h"
#include <stdlib.h>
#include "math.h"
/* USER CODE END Includes */

/* Private typedef -----------------------------------------------------------*/
/* USER CODE BEGIN PTD */
// Struktur Data Sensor untuk ThingSpeak
typedef struct {
    char field1[50]; // Ultrasonik 1-4 (Contoh: "46.3;13.0;14.2;15.0")
    char field2[50]; // Soil Moisture 1-4 (Contoh: "45.6;50.1;48.9;51.2")
    float field3;    // Temperature DHT22
    float field4;    // Humidity DHT22
} ThingSpeakData_t;
/* USER CODE END PTD */

/* Private define ------------------------------------------------------------*/
/* USER CODE BEGIN PD */
#define GSM_TX_DELAY       500  // Jeda kecil antar perintah AT yang berurutan
#define GPRS_CONNECT_DELAY 6000 // Jeda setelah AT+SAPBR=1,1 untuk koneksi GPRS
#define HTTP_ACTION_DELAY  8000 // Jeda setelah AT+HTTPACTION=0 untuk transfer data

// Kredensial ThingSpeak
#define TS_API_KEY      "8ASQO7H6C8RDLIMR"
#define TS_URL_BASE     "api.thingspeak.com"
//#define TS_CONTROL_API_KEY "R917INUSRUUIURPV"
#define TS_CONTROL_URL_FULL "http://api.thingspeak.com/apps/thinghttp/send_request?api_key=R917INUSRUUIURPV"

// !!! GANTI KREDENSIAL APN INI DENGAN OPERATOR ANDA !!!
#define GSM_APN         "internet" // Ganti sesuai operator
#define GSM_APN_USER    ""
#define GSM_APN_PASS    ""

#define TRANSMIT_INTERVAL_MS 10000 // Mengirim setiap 10 detik
/* USER CODE END PD */

/* Private macro -------------------------------------------------------------*/
/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* Private variables ---------------------------------------------------------*/
ADC_HandleTypeDef hadc1;

TIM_HandleTypeDef htim1;
TIM_HandleTypeDef htim3;
TIM_HandleTypeDef htim10;

TIM_HandleTypeDef* htim_array[4] = { &htim1, &htim1, &htim1, &htim10 };
uint32_t channel_array[4] = { TIM_CHANNEL_1, TIM_CHANNEL_2, TIM_CHANNEL_3, TIM_CHANNEL_1 };

UART_HandleTypeDef huart6; // GSM Module

/* USER CODE BEGIN PV */
#define DHT22_PORT GPIOB
#define DHT22_PIN GPIO_PIN_9
uint8_t RH1, RH2, TC1, TC2, SUM, CHECK;
uint32_t pMillis, cMillis;
float tCelsius = 0;
float tFahrenheit = 0;
float RH = 0;

// Variabel GSM/ThingSpeak
char gsm_response_buffer[512] = {0};
ThingSpeakData_t sensorData;

// Variabel untuk Sensor Ultrasonik 1
volatile uint32_t ic_val1_s1 = 0;
volatile uint32_t ic_val2_s1 = 0;
volatile uint32_t difference_s1 = 0;
volatile uint8_t is_first_captured_s1 = 0;
volatile uint8_t capture_done_s1 = 0;
volatile float distance_s1_cm = -1.0;

#define TRIG1_PIN GPIO_PIN_4
#define TRIG1_PORT GPIOA

// Variabel untuk Sensor Ultrasonik 2
volatile uint32_t ic_val1_s2 = 0;
volatile uint32_t ic_val2_s2 = 0;
volatile uint32_t difference_s2 = 0;
volatile uint8_t is_first_captured_s2 = 0;
volatile uint8_t capture_done_s2 = 0;
volatile float distance_s2_cm = -1.0;

#define TRIG2_PIN GPIO_PIN_5
#define TRIG2_PORT GPIOB

// Variabel untuk Sensor Ultrasonik 3
volatile uint32_t ic_val1_s3 = 0;
volatile uint32_t ic_val2_s3 = 0;
volatile uint32_t difference_s3 = 0;
volatile uint8_t is_first_captured_s3 = 0;
volatile uint8_t capture_done_s3 = 0;
volatile float distance_s3_cm = -1.0;

#define TRIG3_PIN GPIO_PIN_5
#define TRIG3_PORT GPIOA

// Variabel untuk Sensor Ultrasonik 4
volatile uint32_t ic_val1_s4 = 0;
volatile uint32_t ic_val2_s4 = 0;
volatile uint32_t difference_s4 = 0;
volatile uint8_t is_first_captured_s4 = 0;
volatile uint8_t capture_done_s4 = 0;
volatile float distance_s4_cm = -1.0;

#define TRIG4_PIN GPIO_PIN_6
#define TRIG4_PORT GPIOA

uint32_t soilMoistureValue1 = 0;
uint32_t soilMoistureValue2 = 0;
uint32_t soilMoistureValue3 = 0;
uint32_t soilMoistureValue4 = 0;

float soilMoisturePercent1 = 0.0f;
float soilMoisturePercent2 = 0.0f;
float soilMoisturePercent3 = 0.0f;
float soilMoisturePercent4 = 0.0f;

// --- VARIABEL GLOBAL THRESHOLD (Mudah Diganti) ---
volatile float g_ultra_min_cm = 5.0f;      // Jarak minimum Ultrasonik (5.0 cm)
volatile float g_ultra_max_cm = 30.0f;     // Jarak maksimum Ultrasonik (30.0 cm)
volatile float g_soil_moisture_percent = 40.0f; // Batas Kelembaban kritis (40%)

volatile uint8_t g_servo_angle_high = 135; // Sudut Servo Aktif
volatile uint8_t g_servo_angle_low = 45;   // Sudut Servo Idle

// --- VARIABEL KONTROL WAKTU SERVO BARU ---
volatile uint32_t servo_open_time[4] = {0}; // Menyimpan waktu saat servo mulai aktif
volatile uint8_t servo_locked_out[4] = {0}; // 1 = Siklus selesai, tunggu kondisi sensor bersih
#define SERVO_OPEN_DURATION_MS 10000        // 10 detik (10000 ms)
#define SERVO_DURATION_MS 10000
uint8_t servo_state = 0;
uint32_t state_start_time = 0;
 volatile uint32_t g_global_open_time = 0; // Waktu mulai siklus pembukaan global
 volatile uint8_t g_global_locked_out = 0;  // Global lockout flag
 volatile uint8_t g_is_rain = 0; // false = 0, true = 1
 volatile uint8_t g_servo_1_open = 0;
 volatile uint8_t g_servo_2_open = 0;
 volatile uint8_t g_servo_3_open = 0;
 volatile uint8_t g_servo_4_open = 0;
/* USER CODE END PV */

/* Private function prototypes -----------------------------------------------*/
void SystemClock_Config(void);
static void MX_GPIO_Init(void);
static void MX_ADC1_Init(void);
static void MX_TIM3_Init(void);
static void MX_TIM1_Init(void);
static void MX_TIM10_Init(void);
static void MX_USART6_UART_Init(void);
/* USER CODE BEGIN PFP */
// Fungsi GSM/Debug
void DebugPrint(const char *msg); // Dipertahankan untuk kompatibilitas fungsi lain
int sendAT_Basic(char command[], int timeout_ms); // Fungsi AT dasar, tabrak langsung
void URL_Encode_Semicolon(const char *source, char *destination, size_t dest_size);
void GSM_SendThingSpeak_GET_HTTP(ThingSpeakData_t *data);

// Fungsi Sensor
void microDelay (uint32_t microseconds);
uint8_t DHT22_Start (void);
uint8_t DHT22_Read (void);
uint32_t ReadSoilMoisture(uint32_t channel);
void HCSR04_Read(uint8_t sensor_id);
void Set_Servo_Angle(TIM_HandleTypeDef *htim, uint32_t channel, uint8_t angle);
void Sweep_Servo(TIM_HandleTypeDef *htim, uint32_t channel);
/* USER CODE END PFP */

/* Private user code ---------------------------------------------------------*/
/* USER CODE BEGIN 0 */
// =================================================================
// FUNGSI GSM (Tabrak Langsung)
// =================================================================
void DebugPrint(const char *msg) {
    // Fungsi ini dikosongkan
}

/**
 * @brief Mengirim AT command tanpa menunggu/memproses respons. Hanya mengirim dan menunggu delay.
 */

uint8_t parseJsonBool(const char *json_string, const char *key) {
    char search_key[30];
    char *ptr;

    // Buat string kunci yang dicari, misal: "is_rain":
    sprintf(search_key, "\"%s\":", key);

    ptr = strstr(json_string, search_key);

    if (ptr) {
        // Pindah pointer ke setelah kunci
        ptr += strlen(search_key);

        // Hapus spasi jika ada
        while (*ptr == ' ' || *ptr == '\t') ptr++;

        // Periksa apakah ada "true" atau "false"
        if (strncmp(ptr, "true", 4) == 0) {
            return 1; // True
        } else if (strncmp(ptr, "false", 5) == 0) {
            return 0; // False
        }
    }
    return 0; // Tidak ditemukan
}

int sendAT_Basic(char command[], int timeout_ms) {
    char ATcommand[500];
    sprintf(ATcommand, "%s\r\n", command);

    // TX Command
    HAL_UART_Transmit(&huart6, (uint8_t*) ATcommand, strlen(ATcommand), 500);

    // Baca dan buang respons (jika ada) untuk membersihkan buffer RX.
    memset(gsm_response_buffer, 0, sizeof(gsm_response_buffer));
    HAL_UART_Receive(&huart6, (uint8_t*)gsm_response_buffer, sizeof(gsm_response_buffer) - 1, 100);

    HAL_Delay(GSM_TX_DELAY); // Jeda kecil setelah perintah
    return 1;
}

void URL_Encode_Semicolon(const char *source, char *destination, size_t dest_size) {
    size_t i = 0, j = 0;
    while (source[i] != '\0' && j < dest_size - 4) {
        if (source[i] == ';') {
            destination[j++] = '%';
            destination[j++] = '3';
            destination[j++] = 'B';
        } else {
            destination[j++] = source[i];
        }
        i++;
    }
    destination[j] = '\0';
}

void GSM_SendThingSpeak_GET_HTTP(ThingSpeakData_t *data) {
    char url_data[400];
    char http_action[450];
    char apn_cmd[100];

    char field1_encoded[100];
    char field2_encoded[100];

    // --- STEP 0: URL ENCODING ---
    URL_Encode_Semicolon(data->field1, field1_encoded, sizeof(field1_encoded));
    URL_Encode_Semicolon(data->field2, field2_encoded, sizeof(field2_encoded));

    // 1. Matikan Bearer (HANYA SEKALI DI AWAL SIKLUS PENGIRIMAN)
    // Walaupun kita ingin menghilangkannya di akhir, ini tetap perlu jika siklus sebelumnya gagal.
    sendAT_Basic("AT+SAPBR=0,1", 0);

    // 2. Set APN dan Buka Bearer
    sendAT_Basic("AT+CGATT=1", 0);
    sendAT_Basic("AT+SAPBR=3,1,\"CONTYPE\",\"GPRS\"", 0);
    snprintf(apn_cmd, sizeof(apn_cmd), "AT+SAPBR=3,1,\"APN\",\"%s\"", GSM_APN);
    sendAT_Basic(apn_cmd, 0);

    // Buka GPRS Bearer
    sendAT_Basic("AT+SAPBR=1,1", 0);
    HAL_Delay(GPRS_CONNECT_DELAY); // JEDA LAMA KRITIS

    // 3. Inisialisasi HTTP Service (Perlu di-INIT jika sebelumnya di-TERM)
    sendAT_Basic("AT+HTTPINIT", 0);

    // 4. Set HTTP Parameter (URL Pengiriman Data Sensor)
    sendAT_Basic("AT+HTTPPARA=\"CID\",1", 0);

    // Set URL Parameter
    sprintf(url_data,
            "http://%s/update?api_key=%s&field1=%s&field2=%s&field3=%.1f&field4=%.1f",
             TS_URL_BASE,
             TS_API_KEY,
             field1_encoded,
             field2_encoded,
             data->field3,
             data->field4);

    snprintf(http_action, sizeof(http_action), "AT+HTTPPARA=\"URL\",\"%s\"", url_data);
    sendAT_Basic(http_action, 0);

    // 5. Eksekusi Metode HTTP (GET: AT+HTTPACTION=0)
    sendAT_Basic("AT+HTTPACTION=0", 0);

    // Tunggu untuk transaksi HTTP selesai
    HAL_Delay(HTTP_ACTION_DELAY);

    // 6. Ambil Respon (AT+HTTPREAD) - Tabrak dan Abaikan
    sendAT_Basic("AT+HTTPREAD", 0);

    // *** PENTING: AT+HTTPTERM dan AT+SAPBR=0,1 DIHAPUS DARI SINI ***
    // Modul tetap dalam kondisi HTTP INIT dan Bearer terbuka
}

void GSM_GetThingSpeakControl(void) {
    char http_action[450];

    // --- Langkah 1: Tidak perlu HTTPINIT lagi (Sudah dilakukan di fungsi sebelumnya) ---
    // Namun, kita perlu SET PARAMETER URL LAGI untuk GET Control

    // 2. Set HTTP Parameter (URL Pengambilan Data Kontrol)
    sendAT_Basic("AT+HTTPPARA=\"CID\",1", 0); // Diulang agar aman

    // Set URL Parameter untuk GET Control
    snprintf(http_action, sizeof(http_action), "AT+HTTPPARA=\"URL\",\"%s\"", TS_CONTROL_URL_FULL);
    sendAT_Basic(http_action, 0);

    // 3. Eksekusi Metode HTTP (GET: AT+HTTPACTION=0)
    sendAT_Basic("AT+HTTPACTION=0", 0);
    HAL_Delay(HTTP_ACTION_DELAY); // Tunggu untuk transaksi HTTP selesai

    // 4. Ambil Respon (AT+HTTPREAD) dan PARSING
    sendAT_Basic("AT+HTTPREAD", 0);

    // ... (Logika Parsing Data dari gsm_response_buffer) ...
    char *json_start = strchr(gsm_response_buffer, '{');

    if (json_start != NULL) {
        // Parsing dan update variabel global
        g_is_rain = parseJsonBool(json_start, "is_rain");
        g_servo_1_open = parseJsonBool(json_start, "servo_1_open");
        g_servo_2_open = parseJsonBool(json_start, "servo_2_open");
        g_servo_3_open = parseJsonBool(json_start, "servo_3_open");
        g_servo_4_open = parseJsonBool(json_start, "servo_4_open");
    }

    // 5. Terminate HTTP dan TUTUP BEARER DI SINI
    sendAT_Basic("AT+HTTPTERM", 0);
    sendAT_Basic("AT+SAPBR=0,1", 0); // Tutup Bearer
}

// =================================================================
// FUNGSI SENSOR (TIDAK BERUBAH)
// =================================================================

void microDelay (uint32_t microseconds)
{
	uint32_t start = DWT->CYCCNT;
	uint32_t cycles = (HAL_RCC_GetHCLKFreq() / 1000000) * microseconds;
	while((DWT->CYCCNT - start) < cycles);
}

uint8_t DHT22_Start (void)
{
  uint8_t Response = 0;
  GPIO_InitTypeDef GPIO_InitStructPrivate = {0};
  GPIO_InitStructPrivate.Pin = DHT22_PIN;
  GPIO_InitStructPrivate.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStructPrivate.Speed = GPIO_SPEED_FREQ_LOW;
  GPIO_InitStructPrivate.Pull = GPIO_NOPULL;
  HAL_GPIO_Init(DHT22_PORT, &GPIO_InitStructPrivate);
  HAL_GPIO_WritePin (DHT22_PORT, DHT22_PIN, 0);
  microDelay (1300);
  HAL_GPIO_WritePin (DHT22_PORT, DHT22_PIN, 1);
  microDelay (30);
  GPIO_InitStructPrivate.Mode = GPIO_MODE_INPUT;
  GPIO_InitStructPrivate.Pull = GPIO_PULLUP;
  HAL_GPIO_Init(DHT22_PORT, &GPIO_InitStructPrivate);
  microDelay (40);
  if (!(HAL_GPIO_ReadPin (DHT22_PORT, DHT22_PIN)))
  {
    microDelay (80);
    if ((HAL_GPIO_ReadPin (DHT22_PORT, DHT22_PIN))) Response = 1;
  }

  uint32_t Timeout = (HAL_RCC_GetHCLKFreq() / 1000000) * 100;
  uint32_t start = DWT->CYCCNT;
  while(HAL_GPIO_ReadPin(DHT22_PORT, DHT22_PIN) && (DWT->CYCCNT - start < Timeout));

  return Response;
}

uint8_t DHT22_Read (void)
{
  uint8_t data = 0;
  uint8_t bits_received = 0;
  uint32_t last_cycle = DWT->CYCCNT;

  while(HAL_GPIO_ReadPin(DHT22_PORT, DHT22_PIN) == GPIO_PIN_SET)
  {
      if ((DWT->CYCCNT - last_cycle) > (HAL_RCC_GetHCLKFreq() / 1000000) * 100) return 255;
  }

  for (bits_received = 0; bits_received < 40; bits_received++)
  {
      last_cycle = DWT->CYCCNT;
      while(HAL_GPIO_ReadPin(DHT22_PORT, DHT22_PIN) == GPIO_PIN_RESET)
      {
          if ((DWT->CYCCNT - last_cycle) > (HAL_RCC_GetHCLKFreq() / 1000000) * 100) return 255;
      }

      last_cycle = DWT->CYCCNT;
      while(HAL_GPIO_ReadPin(DHT22_PORT, DHT22_PIN) == GPIO_PIN_SET)
      {
          if ((DWT->CYCCNT - last_cycle) > (HAL_RCC_GetHCLKFreq() / 1000000) * 100) return 255;
      }
      uint32_t high_duration = DWT->CYCCNT - last_cycle;

      data <<= 1;
      if (high_duration > (HAL_RCC_GetHCLKFreq() / 1000000) * 40)
      {
          data |= 1;
      }

      if (bits_received == 7) RH1 = data;
      else if (bits_received == 15) RH2 = data;
      else if (bits_received == 23) TC1 = data;
      else if (bits_received == 31) TC2 = data;
      else if (bits_received == 39) SUM = data;
  }
  return 1;
}

uint32_t ReadSoilMoisture(uint32_t channel)
{
    ADC_ChannelConfTypeDef sConfig = {0};
    sConfig.Channel = channel;
    sConfig.Rank = 1;
    sConfig.SamplingTime = ADC_SAMPLETIME_3CYCLES;
    if (HAL_ADC_ConfigChannel(&hadc1, &sConfig) != HAL_OK)
    {
        return 9999;
    }
    HAL_StatusTypeDef status;
    status = HAL_ADC_Start(&hadc1);
    if (status != HAL_OK) return 9999;
    status = HAL_ADC_PollForConversion(&hadc1, 100);
    if (status != HAL_OK) return 9999;
    return HAL_ADC_GetValue(&hadc1);
}

void HAL_TIM_IC_CaptureCallback(TIM_HandleTypeDef *htim)
{
    if (htim->Instance == TIM3)
    {
        // Logika untuk Sensor 1 (Channel 1)
        if (htim->Channel == HAL_TIM_ACTIVE_CHANNEL_1)
        {
            if (is_first_captured_s1 == 0)
            {
                ic_val1_s1 = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_1);
                is_first_captured_s1 = 1;
                __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_1, TIM_INPUTCHANNELPOLARITY_FALLING);
            }
            else if (is_first_captured_s1 == 1)
            {
                ic_val2_s1 = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_1);
                if (ic_val2_s1 > ic_val1_s1) difference_s1 = ic_val2_s1 - ic_val1_s1;
                else difference_s1 = (0xffff - ic_val1_s1) + ic_val2_s1;
                distance_s1_cm = (float)difference_s1 * 0.034 / 2;
                is_first_captured_s1 = 0;
                capture_done_s1 = 1;
                __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_1, TIM_INPUTCHANNELPOLARITY_RISING);
            }
        }

        // Logika untuk Sensor 2 (Channel 2)
        if (htim->Channel == HAL_TIM_ACTIVE_CHANNEL_2)
        {
            if (is_first_captured_s2 == 0)
            {
                ic_val1_s2 = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_2);
                is_first_captured_s2 = 1;
                __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_2, TIM_INPUTCHANNELPOLARITY_FALLING);
            }
            else if (is_first_captured_s2 == 1)
            {
                ic_val2_s2 = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_2);
                if (ic_val2_s2 > ic_val1_s2) difference_s2 = ic_val2_s2 - ic_val1_s2;
                else difference_s2 = (0xffff - ic_val1_s2) + ic_val2_s2;
                distance_s2_cm = (float)difference_s2 * 0.034 / 2;
                is_first_captured_s2 = 0;
                capture_done_s2 = 1;
                __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_2, TIM_INPUTCHANNELPOLARITY_RISING);
            }
        }

        // Logika untuk Sensor 3 (Channel 3)
        if (htim->Channel == HAL_TIM_ACTIVE_CHANNEL_3)
        {
            if (is_first_captured_s3 == 0)
            {
                ic_val1_s3 = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_3);
                is_first_captured_s3 = 1;
                __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_3, TIM_INPUTCHANNELPOLARITY_FALLING);
            }
            else if (is_first_captured_s3 == 1)
            {
                ic_val2_s3 = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_3);
                if (ic_val2_s3 > ic_val1_s3) difference_s3 = ic_val2_s3 - ic_val1_s3;
                else difference_s3 = (0xffff - ic_val1_s3) + ic_val2_s3;
                distance_s3_cm = (float)difference_s3 * 0.034 / 2;
                is_first_captured_s3 = 0;
                capture_done_s3 = 1;
                __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_3, TIM_INPUTCHANNELPOLARITY_RISING);
            }
        }
        if (htim->Channel == HAL_TIM_ACTIVE_CHANNEL_4)
                {
                    if (is_first_captured_s4 == 0)
                    {
                        ic_val1_s4 = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_4);
                        is_first_captured_s4 = 1;
                        __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_4, TIM_INPUTCHANNELPOLARITY_FALLING);
                    }
                    else if (is_first_captured_s4 == 1)
                    {
                        ic_val2_s4 = HAL_TIM_ReadCapturedValue(htim, TIM_CHANNEL_4);
                        if (ic_val2_s4 > ic_val1_s4) difference_s4 = ic_val2_s4 - ic_val1_s4;
                        else difference_s4 = (0xffff - ic_val1_s4) + ic_val2_s4;
                        distance_s4_cm = (float)difference_s4 * 0.034 / 2;
                        is_first_captured_s4 = 0;
                        capture_done_s4 = 1;
                        __HAL_TIM_SET_CAPTUREPOLARITY(htim, TIM_CHANNEL_4, TIM_INPUTCHANNELPOLARITY_RISING);
                    }
                }
    }
}
void HCSR04_Read(uint8_t sensor_id)
{
    TIM_TypeDef *TimerInstance = htim3.Instance;
    uint32_t TimerChannel;
    GPIO_TypeDef *TrigPort;
    uint16_t TrigPin;
    uint32_t TimerCCxIT;

    // Menentukan pin dan channel berdasarkan sensor_id
    switch (sensor_id) {
        case 1:
            TimerChannel = TIM_CHANNEL_1; TrigPort = TRIG1_PORT; TrigPin = TRIG1_PIN; TimerCCxIT = TIM_IT_CC1;
            is_first_captured_s1 = 0; capture_done_s1 = 0;
            break;
        case 2:
            TimerChannel = TIM_CHANNEL_2; TrigPort = TRIG2_PORT; TrigPin = TRIG2_PIN; TimerCCxIT = TIM_IT_CC2;
            is_first_captured_s2 = 0; capture_done_s2 = 0;
            break;
        case 3:
            TimerChannel = TIM_CHANNEL_3; TrigPort = TRIG3_PORT; TrigPin = TRIG3_PIN; TimerCCxIT = TIM_IT_CC3;
            is_first_captured_s3 = 0; capture_done_s3 = 0;
            break;
        case 4:
            TimerChannel = TIM_CHANNEL_4; TrigPort = TRIG4_PORT; TrigPin = TRIG4_PIN; TimerCCxIT = TIM_IT_CC4;
            is_first_captured_s4 = 0; capture_done_s4 = 0;
            break;
        default: return;
    }

    // Reset dan aktifkan interupsi
    __HAL_TIM_SET_CAPTUREPOLARITY(&htim3, TimerChannel, TIM_INPUTCHANNELPOLARITY_RISING);
    __HAL_TIM_ENABLE_IT(&htim3, TimerCCxIT);

    // Kirim pulsa trigger
    HAL_GPIO_WritePin(TrigPort, TrigPin, GPIO_PIN_SET);
    microDelay(10);
    HAL_GPIO_WritePin(TrigPort, TrigPin, GPIO_PIN_RESET);
}

void Set_Servo_Angle(TIM_HandleTypeDef *htim, uint32_t channel, uint8_t angle)
{
    if (angle > 180) angle = 180;

    // Formula: CCR = 500 + (angle * 2000 / 180)
    uint32_t pulse_value = 500 + ((uint32_t)angle * 2000) / 180;

    __HAL_TIM_SET_COMPARE(htim, channel, pulse_value);
}

void Sweep_Servo(TIM_HandleTypeDef *htim, uint32_t channel)
{
    // Maju: 0 -> 180
    for (uint8_t angle = 0; angle <= 180; angle += 5)
    {
        Set_Servo_Angle(htim, channel, angle);
        HAL_Delay(10);
    }

    // Mundur: 180 -> 0
    for (int angle = 180; angle >= 0; angle -= 5)
    {
        Set_Servo_Angle(htim, channel, angle);
        HAL_Delay(10);
    }
    HAL_Delay(100); // Jeda
}

/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{

  /* USER CODE BEGIN 1 */
  uint32_t last_tx_time = 0;
  float temp_c = 0.0f;
  float hum_rh = 0.0f;
  uint8_t dht_success = 0;
  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */
  CoreDebug->DEMCR |= CoreDebug_DEMCR_TRCENA_Msk;
  DWT->CYCCNT = 0;
  DWT->CTRL |= DWT_CTRL_CYCCNTENA_Msk;
  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();
  MX_ADC1_Init();
  MX_TIM3_Init();
  MX_TIM1_Init();
  MX_TIM10_Init();
  MX_USART6_UART_Init();
  /* USER CODE BEGIN 2 */
  // Inisialisasi GSM
  sendAT_Basic("ATE0", 0); // Matikan Echo
  sendAT_Basic("AT", 0);    // Cek modul

  // Mulai timer Input Capture untuk semua sensor ultrasonik
  HAL_TIM_IC_Start_IT(&htim3, TIM_CHANNEL_1);
  HAL_TIM_IC_Start_IT(&htim3, TIM_CHANNEL_2);
  HAL_TIM_IC_Start_IT(&htim3, TIM_CHANNEL_3);
  HAL_TIM_IC_Start_IT(&htim3, TIM_CHANNEL_4);

  // Mulai PWM untuk Servo
  HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_1);
  HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_2);
  HAL_TIM_PWM_Start(&htim1, TIM_CHANNEL_3);
  HAL_TIM_PWM_Start(&htim10, TIM_CHANNEL_1);

  Set_Servo_Angle(&htim1, TIM_CHANNEL_1,g_servo_angle_low);
  Set_Servo_Angle(&htim1, TIM_CHANNEL_2,g_servo_angle_low);
  Set_Servo_Angle(&htim1, TIM_CHANNEL_3,g_servo_angle_low);
  Set_Servo_Angle(&htim10, TIM_CHANNEL_1,g_servo_angle_low);
  /* USER CODE END 2 */

  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
	        // --- 1. PEMBACAAN SEMUA SENSOR ULTRASONIK ---
	        // Pembacaan S1
	        HCSR04_Read(1);
	        uint32_t timeout_start = HAL_GetTick();
	        while(capture_done_s1 == 0 && (HAL_GetTick() - timeout_start) < 500);
	        if (capture_done_s1 == 0 || distance_s1_cm > 400 || distance_s1_cm <= 1) distance_s1_cm = -1.0;

	        // Pembacaan S2
	        HCSR04_Read(2);
	        timeout_start = HAL_GetTick();
	        while(capture_done_s2 == 0 && (HAL_GetTick() - timeout_start) < 500);
	        if (capture_done_s2 == 0 || distance_s2_cm > 400 || distance_s2_cm <= 1) distance_s2_cm = -1.0;

	        // Pembacaan S3
	        HCSR04_Read(3);
	        timeout_start = HAL_GetTick();
	        while(capture_done_s3 == 0 && (HAL_GetTick() - timeout_start) < 500);
	        if (capture_done_s3 == 0 || distance_s3_cm > 400 || distance_s3_cm <= 1) distance_s3_cm = -1.0;

	        // Pembacaan S4
	        HCSR04_Read(4);
	        timeout_start = HAL_GetTick();
	        while(capture_done_s4 == 0 && (HAL_GetTick() - timeout_start) < 500);
	        if (capture_done_s4 == 0 || distance_s4_cm > 400 || distance_s4_cm <= 1) distance_s4_cm = -1.0;

	        // --- 2. PEMBACAAN KELEMBABAN TANAH ---
	        soilMoistureValue1 = ReadSoilMoisture(ADC_CHANNEL_0);
	        soilMoisturePercent1 = (4095.0f - soilMoistureValue1) / 4095.0f * 100.0f;
	        soilMoistureValue2 = ReadSoilMoisture(ADC_CHANNEL_1);
	        soilMoisturePercent2 = (4095.0f - soilMoistureValue2) / 4095.0f * 100.0f;
	        soilMoistureValue3 = ReadSoilMoisture(ADC_CHANNEL_2);
	        soilMoisturePercent3 = (4095.0f - soilMoistureValue3) / 4095.0f * 100.0f;
	        soilMoistureValue4 = ReadSoilMoisture(ADC_CHANNEL_3);
	        soilMoisturePercent4 = (4095.0f - soilMoistureValue4) / 4095.0f * 100.0f;

	        // --- 3. PEMBACAAN DHT22 ---
	        temp_c = -1.0f; // Default error
	        hum_rh = -1.0f; // Default error
	        dht_success = 0;

	        if (DHT22_Start())
	        {
	            if (DHT22_Read() == 1)
	            {
	                CHECK = RH1 + RH2 + TC1 + TC2;
	                if (CHECK == SUM)
	                {
	                    if (TC1 > 127) temp_c = (float)TC2 / 10 * (-1);
	                    else temp_c = (float)((TC1 << 8) | TC2) / 10;
	                    RH = (float)((RH1 << 8) | RH2) / 10;
	                    dht_success = 1;
	                }
	            }
	        }

	        // --- 4. PEMBENTUKAN DATA THINGSPEAK ---
	        // field1: ultrasonik1;ultrasonik2;ultrasonik3;ultrasonik4
	        snprintf(sensorData.field1, sizeof(sensorData.field1),
	                 "%.1f;%.1f;%.1f;%.1f",
	                 distance_s1_cm, distance_s2_cm, distance_s3_cm, distance_s4_cm);

	        // field2: soil moisture1;soil moisture2;soil moisture3;soil moisture4
	        snprintf(sensorData.field2, sizeof(sensorData.field2),
	                 "%.1f;%.1f;%.1f;%.1f",
	                 soilMoisturePercent1, soilMoisturePercent2, soilMoisturePercent3, soilMoisturePercent4);

	        // field3: temperature dht22 (Gunakan -1.0 jika gagal)
	        sensorData.field3 = (dht_success) ? temp_c : -1.0f;

	        // field4: humidity dht22 (Gunakan -1.0 jika gagal)
	        sensorData.field4 = (dht_success) ? RH : -1.0f;


	        // --- 5. PENGIRIMAN THINGSPEAK (Setiap 10 detik) ---
	        if (HAL_GetTick() - last_tx_time >= TRANSMIT_INTERVAL_MS)
	        {
	            GSM_SendThingSpeak_GET_HTTP(&sensorData);
	            GSM_GetThingSpeakControl();
	            last_tx_time = HAL_GetTick();
	        }

	        // ==========================================================
	            // --- 6. LOGIKA KONTROL SERVO (BLOCKING 10 DETIK) ---
	            // ==========================================================
	  //          uint32_t current_time = HAL_GetTick();
	            uint8_t any_condition_met = 0;

	            // A. Tentukan Kondisi OR untuk Setiap Servo
	            uint8_t conditions[4];
	  //          conditions[0] = (soilMoisturePercent1 < g_soil_moisture_percent || (distance_s1_cm > g_ultra_min_cm && distance_s1_cm < g_ultra_max_cm));
	  //          conditions[1] = (soilMoisturePercent2 < g_soil_moisture_percent || (distance_s2_cm > g_ultra_min_cm && distance_s2_cm < g_ultra_max_cm));
	  //          conditions[2] = (soilMoisturePercent3 < g_soil_moisture_percent || (distance_s3_cm > g_ultra_min_cm && distance_s3_cm < g_ultra_max_cm));
	  //          conditions[3] = (soilMoisturePercent4 < g_soil_moisture_percent || (distance_s4_cm > g_ultra_min_cm && distance_s4_cm < g_ultra_max_cm));

	            conditions[0] = 0;
	            conditions[1] = 0;
	            conditions[2] = 0;
	            conditions[3] = 0;

	            uint8_t sensor_only_met = 0;
	                      for (int i = 0; i < 4; i++)
	                      {
	                          if (conditions[i])
	                          {
	                              sensor_only_met = 1;
	                              break;
	                          }
	                      }

	                      // Tentukan apakah ada OVERRIDE REMOTE (True = 1)
	                      uint8_t remote_override[4];
	                      remote_override[0] = g_servo_1_open;
	                      remote_override[1] = g_servo_2_open;
	                      remote_override[2] = g_servo_3_open;
	                      remote_override[3] = g_servo_4_open;

	                      // Cek apakah ADA SATU SAJA servo yang di-override oleh remote
	                      uint8_t remote_met = 0;
	                      if (remote_override[0] || remote_override[1] || remote_override[2] || remote_override[3]) {
	                          remote_met = 1;
	                      }


	                      // TAHAP 1: MEMULAI SIKLUS BUKA (Menggunakan Blocking While)
	                      static uint32_t servo_timer_start = 0;
	                      static uint8_t servo_active = 0;
	                      // Kondisi Pemicu Global: Jika ADA SENSOR yang met ATAU ADA REMOTE yang aktif
	                      if (sensor_only_met || remote_met)
	                      {
	                          // --- PEMBERIAN SUDUT HIGH (Prioritas Remote) ---
	                    	  // Servo 1
	                    	  if (conditions[0] || remote_override[0]) {
	                    	      Set_Servo_Angle(&htim1, TIM_CHANNEL_1, g_servo_angle_high);
	                    	  } else {
	                    	      Set_Servo_Angle(&htim1, TIM_CHANNEL_1, g_servo_angle_low);
	                    	  }

	                    	  // Servo 2
	                    	  if (conditions[1] || remote_override[1]) {
	                    	      Set_Servo_Angle(&htim1, TIM_CHANNEL_2, g_servo_angle_high);
	                    	  } else {
	                    	      Set_Servo_Angle(&htim1, TIM_CHANNEL_2, g_servo_angle_low);
	                    	  }

	                    	  // Servo 3
	                    	  if (conditions[2] || remote_override[2]) {
	                    	      Set_Servo_Angle(&htim1, TIM_CHANNEL_3, g_servo_angle_high);
	                    	  } else {
	                    	      Set_Servo_Angle(&htim1, TIM_CHANNEL_3, g_servo_angle_low);
	                    	  }

	                    	  // Servo 4
	                    	  if (conditions[3] || remote_override[3]) {
	                    	      Set_Servo_Angle(&htim10, TIM_CHANNEL_1, g_servo_angle_high);
	                    	  } else {
	                    	      Set_Servo_Angle(&htim10, TIM_CHANNEL_1, g_servo_angle_low);
	                    	  }


	                          // --- BLOCKING TIMER 10 DETIK ---
	                          // Timer blocking dilakukan karena ada setidaknya satu servo yang terbuka (sensor atau remote).
	                          uint32_t start_tick = HAL_GetTick();
	                          uint32_t elapsed_time = 0;
	                          while (elapsed_time < SERVO_OPEN_DURATION_MS)
	                          {
	                              // Hitung waktu yang berlalu
	                              elapsed_time = HAL_GetTick() - start_tick;

	                              // Catatan: JANGAN masukkan HAL_Delay() di sini, karena akan memperpanjang waktu.
	                          }
	                      }

	                      // TAHAP 2: MENUTUP SEMUA SERVO (Setelah Blocking Selesai atau Tidak Ada Trigger)
	                      // Ini dieksekusi HANYA setelah timer 10 detik habis (jika dimulai) ATAU jika tidak ada trigger
	                      Set_Servo_Angle(&htim1, TIM_CHANNEL_1, g_servo_angle_low);
	                      Set_Servo_Angle(&htim1, TIM_CHANNEL_2, g_servo_angle_low);
	                      Set_Servo_Angle(&htim1, TIM_CHANNEL_3, g_servo_angle_low);
	                      Set_Servo_Angle(&htim10, TIM_CHANNEL_1, g_servo_angle_low);

	                      HAL_Delay(500); // Main loop delay (untuk tujuan pengujian)


  }
  /* USER CODE END 3 */
}

/**
  * @brief System Clock Configuration
  * @retval None
  */
void SystemClock_Config(void)
{
  RCC_OscInitTypeDef RCC_OscInitStruct = {0};
  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};

  /** Configure the main internal regulator output voltage
  */
  __HAL_RCC_PWR_CLK_ENABLE();
  __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE1);

  /** Initializes the RCC Oscillators according to the specified parameters
  * in the RCC_OscInitStruct structure.
  */
  RCC_OscInitStruct.OscillatorType = RCC_OSCILLATORTYPE_HSI;
  RCC_OscInitStruct.HSIState = RCC_HSI_ON;
  RCC_OscInitStruct.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;
  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;
  RCC_OscInitStruct.PLL.PLLSource = RCC_PLLSOURCE_HSI;
  RCC_OscInitStruct.PLL.PLLM = 8;
  RCC_OscInitStruct.PLL.PLLN = 72;
  RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV2;
  RCC_OscInitStruct.PLL.PLLQ = 4;
  if (HAL_RCC_OscConfig(&RCC_OscInitStruct) != HAL_OK)
  {
    Error_Handler();
  }

  /** Initializes the CPU, AHB and APB buses clocks
  */
  RCC_ClkInitStruct.ClockType = RCC_CLOCKTYPE_HCLK|RCC_CLOCKTYPE_SYSCLK
                              |RCC_CLOCKTYPE_PCLK1|RCC_CLOCKTYPE_PCLK2;
  RCC_ClkInitStruct.SYSCLKSource = RCC_SYSCLKSOURCE_PLLCLK;
  RCC_ClkInitStruct.AHBCLKDivider = RCC_SYSCLK_DIV1;
  RCC_ClkInitStruct.APB1CLKDivider = RCC_HCLK_DIV2;
  RCC_ClkInitStruct.APB2CLKDivider = RCC_HCLK_DIV1;

  if (HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_2) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief ADC1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_ADC1_Init(void)
{
  ADC_ChannelConfTypeDef sConfig = {0};

  hadc1.Instance = ADC1;
  hadc1.Init.ClockPrescaler = ADC_CLOCK_SYNC_PCLK_DIV2;
  hadc1.Init.Resolution = ADC_RESOLUTION_12B;
  hadc1.Init.ScanConvMode = DISABLE;
  hadc1.Init.ContinuousConvMode = DISABLE;
  hadc1.Init.DiscontinuousConvMode = DISABLE;
  hadc1.Init.ExternalTrigConvEdge = ADC_EXTERNALTRIGCONVEDGE_NONE;
  hadc1.Init.ExternalTrigConv = ADC_SOFTWARE_START;
  hadc1.Init.DataAlign = ADC_DATAALIGN_RIGHT;
  hadc1.Init.NbrOfConversion = 1;
  hadc1.Init.DMAContinuousRequests = DISABLE;
  hadc1.Init.EOCSelection = ADC_EOC_SINGLE_CONV;
  if (HAL_ADC_Init(&hadc1) != HAL_OK)
  {
    Error_Handler();
  }

  sConfig.Channel = ADC_CHANNEL_0;
  sConfig.Rank = 1;
  sConfig.SamplingTime = ADC_SAMPLETIME_3CYCLES;
  if (HAL_ADC_ConfigChannel(&hadc1, &sConfig) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief TIM1 Initialization Function
  * @param None
  * @retval None
  */
static void MX_TIM1_Init(void)
{
  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};
  TIM_OC_InitTypeDef sConfigOC = {0};
  TIM_BreakDeadTimeConfigTypeDef sBreakDeadTimeConfig = {0};

  htim1.Instance = TIM1;
  htim1.Init.Prescaler = 72;
  htim1.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim1.Init.Period = 19999;
  htim1.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim1.Init.RepetitionCounter = 0;
  htim1.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  if (HAL_TIM_Base_Init(&htim1) != HAL_OK)
  {
    Error_Handler();
  }
  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  if (HAL_TIM_ConfigClockSource(&htim1, &sClockSourceConfig) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_TIM_PWM_Init(&htim1) != HAL_OK)
  {
    Error_Handler();
  }
  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  if (HAL_TIMEx_MasterConfigSynchronization(&htim1, &sMasterConfig) != HAL_OK)
  {
    Error_Handler();
  }
  sConfigOC.OCMode = TIM_OCMODE_PWM1;
  sConfigOC.Pulse = 0;
  sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
  sConfigOC.OCNPolarity = TIM_OCNPOLARITY_HIGH;
  sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
  sConfigOC.OCIdleState = TIM_OCIDLESTATE_RESET;
  sConfigOC.OCNIdleState = TIM_OCNIDLESTATE_RESET;
  if (HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_1) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_2) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_TIM_PWM_ConfigChannel(&htim1, &sConfigOC, TIM_CHANNEL_3) != HAL_OK)
  {
    Error_Handler();
  }
  sBreakDeadTimeConfig.OffStateRunMode = TIM_OSSR_DISABLE;
  sBreakDeadTimeConfig.OffStateIDLEMode = TIM_OSSI_DISABLE;
  sBreakDeadTimeConfig.LockLevel = TIM_LOCKLEVEL_OFF;
  sBreakDeadTimeConfig.DeadTime = 0;
  sBreakDeadTimeConfig.BreakState = TIM_BREAK_DISABLE;
  sBreakDeadTimeConfig.BreakPolarity = TIM_BREAKPOLARITY_HIGH;
  sBreakDeadTimeConfig.AutomaticOutput = TIM_AUTOMATICOUTPUT_DISABLE;
  if (HAL_TIMEx_ConfigBreakDeadTime(&htim1, &sBreakDeadTimeConfig) != HAL_OK)
  {
    Error_Handler();
  }
  HAL_TIM_MspPostInit(&htim1);

}

/**
  * @brief TIM3 Initialization Function
  * @param None
  * @retval None
  */
static void MX_TIM3_Init(void)
{

  TIM_ClockConfigTypeDef sClockSourceConfig = {0};
  TIM_MasterConfigTypeDef sMasterConfig = {0};
  TIM_IC_InitTypeDef sConfigIC = {0};

  htim3.Instance = TIM3;
  htim3.Init.Prescaler = 72-1;
  htim3.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim3.Init.Period = 65535;
  htim3.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim3.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  if (HAL_TIM_Base_Init(&htim3) != HAL_OK)
  {
    Error_Handler();
  }
  sClockSourceConfig.ClockSource = TIM_CLOCKSOURCE_INTERNAL;
  if (HAL_TIM_ConfigClockSource(&htim3, &sClockSourceConfig) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_TIM_IC_Init(&htim3) != HAL_OK)
  {
    Error_Handler();
  }
  sMasterConfig.MasterOutputTrigger = TIM_TRGO_RESET;
  sMasterConfig.MasterSlaveMode = TIM_MASTERSLAVEMODE_DISABLE;
  if (HAL_TIMEx_MasterConfigSynchronization(&htim3, &sMasterConfig) != HAL_OK)
  {
    Error_Handler();
  }
  sConfigIC.ICPolarity = TIM_INPUTCHANNELPOLARITY_RISING;
  sConfigIC.ICSelection = TIM_ICSELECTION_DIRECTTI;
  sConfigIC.ICPrescaler = TIM_ICPSC_DIV1;
  sConfigIC.ICFilter = 0;
  if (HAL_TIM_IC_ConfigChannel(&htim3, &sConfigIC, TIM_CHANNEL_1) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_TIM_IC_ConfigChannel(&htim3, &sConfigIC, TIM_CHANNEL_2) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_TIM_IC_ConfigChannel(&htim3, &sConfigIC, TIM_CHANNEL_3) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_TIM_IC_ConfigChannel(&htim3, &sConfigIC, TIM_CHANNEL_4) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief TIM10 Initialization Function
  * @param None
  * @retval None
  */
static void MX_TIM10_Init(void)
{
  TIM_OC_InitTypeDef sConfigOC = {0};

  htim10.Instance = TIM10;
  htim10.Init.Prescaler = 72;
  htim10.Init.CounterMode = TIM_COUNTERMODE_UP;
  htim10.Init.Period = 19999;
  htim10.Init.ClockDivision = TIM_CLOCKDIVISION_DIV1;
  htim10.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_DISABLE;
  if (HAL_TIM_Base_Init(&htim10) != HAL_OK)
  {
    Error_Handler();
  }
  if (HAL_TIM_PWM_Init(&htim10) != HAL_OK)
  {
    Error_Handler();
  }
  sConfigOC.OCMode = TIM_OCMODE_PWM1;
  sConfigOC.Pulse = 0;
  sConfigOC.OCPolarity = TIM_OCPOLARITY_HIGH;
  sConfigOC.OCFastMode = TIM_OCFAST_DISABLE;
  if (HAL_TIM_PWM_ConfigChannel(&htim10, &sConfigOC, TIM_CHANNEL_1) != HAL_OK)
  {
    Error_Handler();
  }
  HAL_TIM_MspPostInit(&htim10);
}

/**
  * @brief USART6 Initialization Function
  * @param None
  * @retval None
  */
static void MX_USART6_UART_Init(void)
{
  huart6.Instance = USART6;
  huart6.Init.BaudRate = 115200;
  huart6.Init.WordLength = UART_WORDLENGTH_8B;
  huart6.Init.StopBits = UART_STOPBITS_1;
  huart6.Init.Parity = UART_PARITY_NONE;
  huart6.Init.Mode = UART_MODE_TX_RX;
  huart6.Init.HwFlowCtl = UART_HWCONTROL_NONE;
  huart6.Init.OverSampling = UART_OVERSAMPLING_16;
  if (HAL_UART_Init(&huart6) != HAL_OK)
  {
    Error_Handler();
  }
}

/**
  * @brief GPIO Initialization Function
  * @param None
  * @retval None
  */
static void MX_GPIO_Init(void)
{
  GPIO_InitTypeDef GPIO_InitStruct = {0};

  /* GPIO Ports Clock Enable */
  __HAL_RCC_GPIOH_CLK_ENABLE();
  __HAL_RCC_GPIOA_CLK_ENABLE();
  __HAL_RCC_GPIOB_CLK_ENABLE();

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOA, GPIO_PIN_4|GPIO_PIN_5|GPIO_PIN_6, GPIO_PIN_RESET);

  /*Configure GPIO pin Output Level */
  HAL_GPIO_WritePin(GPIOB, GPIO_PIN_5|GPIO_PIN_9, GPIO_PIN_RESET);

  /*Configure GPIO pins : PA4 PA5 PA6 */
  GPIO_InitStruct.Pin = GPIO_PIN_4|GPIO_PIN_5|GPIO_PIN_6;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);

  /*Configure GPIO pins : PB5 PB9 */
  GPIO_InitStruct.Pin = GPIO_PIN_5|GPIO_PIN_9;
  GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
  GPIO_InitStruct.Pull = GPIO_NOPULL;
  GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
  HAL_GPIO_Init(GPIOB, &GPIO_InitStruct);
}

/**
  * @brief  This function is executed in case of error occurrence.
  * @retval None
  */
void Error_Handler(void)
{
  /* USER CODE BEGIN Error_Handler_Debug */
  __disable_irq();
  while (1)
  {
  }
  /* USER CODE END Error_Handler_Debug */
}

#ifdef  USE_FULL_ASSERT
/**
  * @brief  Reports the name of the source file and the source line number
  * where the assert_param error has occurred.
  * @param  file: pointer to the source file name
  * @param  line: assert_param error line source number
  * @retval None
  */
void assert_failed(uint8_t *file, uint32_t line)
{
  /* USER CODE BEGIN 6 */
  /* User can add his own implementation to report the file name and line number,
     ex: printf("Wrong parameters value: file %s on line %d\r\n", file, line) */
  /* USER CODE END 6 */
}
#endif /* USE_FULL_ASSERT */
