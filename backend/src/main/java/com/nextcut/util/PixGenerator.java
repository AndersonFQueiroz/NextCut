package com.nextcut.util;

import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.util.Locale;

public class PixGenerator {
    
    // IDs do Payload EMV
    private static final String ID_PAYLOAD_FORMAT_INDICATOR = "00";
    private static final String ID_MERCHANT_ACCOUNT_INFORMATION = "26";
    private static final String ID_MERCHANT_ACCOUNT_INFORMATION_GUI = "00";
    private static final String ID_MERCHANT_ACCOUNT_INFORMATION_KEY = "01";
    private static final String ID_MERCHANT_ACCOUNT_INFORMATION_DESCRIPTION = "02";
    private static final String ID_MERCHANT_CATEGORY_CODE = "52";
    private static final String ID_TRANSACTION_CURRENCY = "53";
    private static final String ID_TRANSACTION_AMOUNT = "54";
    private static final String ID_COUNTRY_CODE = "58";
    private static final String ID_MERCHANT_NAME = "59";
    private static final String ID_MERCHANT_CITY = "60";
    private static final String ID_ADDITIONAL_DATA_FIELD_TEMPLATE = "62";
    private static final String ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TXID = "05";
    private static final String ID_CRC16 = "63";

    /**
     * Gera o Payload Pix estático (BR Code) de acordo com o manual do BACEN.
     *
     * @param pixKey      A chave PIX do recebedor (telefone, CPF/CNPJ, email ou aleatória).
     * @param amount      Valor da transação (pode ser 0.00 se for livre).
     * @param merchantName Nome do recebedor (sem acentos).
     * @param merchantCity Cidade do recebedor (sem acentos).
     * @param txid        ID da transação (até 25 caracteres) ou "***" para vazio.
     * @return String contendo o payload EMV completo, com CRC16.
     */
    public static String generatePayload(String pixKey, double amount, String merchantName, String merchantCity, String txid) {
        StringBuilder payload = new StringBuilder();

        payload.append(formatValue(ID_PAYLOAD_FORMAT_INDICATOR, "01"));
        
        String accountInfo = formatValue(ID_MERCHANT_ACCOUNT_INFORMATION_GUI, "br.gov.bcb.pix") +
                             formatValue(ID_MERCHANT_ACCOUNT_INFORMATION_KEY, pixKey);
        payload.append(formatValue(ID_MERCHANT_ACCOUNT_INFORMATION, accountInfo));
        
        payload.append(formatValue(ID_MERCHANT_CATEGORY_CODE, "0000"));
        payload.append(formatValue(ID_TRANSACTION_CURRENCY, "986")); // 986 = BRL
        
        if (amount > 0) {
            DecimalFormat df = new DecimalFormat("0.00", new DecimalFormatSymbols(Locale.US));
            payload.append(formatValue(ID_TRANSACTION_AMOUNT, df.format(amount)));
        }

        payload.append(formatValue(ID_COUNTRY_CODE, "BR"));
        
        // Limita a 25 caracteres conforme padrão
        String name = merchantName != null ? merchantName.replaceAll("[^a-zA-Z0-9 ]", "").trim() : "RECEBEDOR";
        name = name.length() > 25 ? name.substring(0, 25) : name;
        payload.append(formatValue(ID_MERCHANT_NAME, name));
        
        // Limita a 15 caracteres conforme padrão
        String city = merchantCity != null ? merchantCity.replaceAll("[^a-zA-Z0-9 ]", "").trim() : "CIDADE";
        city = city.length() > 15 ? city.substring(0, 15) : city;
        payload.append(formatValue(ID_MERCHANT_CITY, city));
        
        String transactionId = (txid == null || txid.isBlank()) ? "***" : txid;
        String additionalData = formatValue(ID_ADDITIONAL_DATA_FIELD_TEMPLATE_TXID, transactionId);
        payload.append(formatValue(ID_ADDITIONAL_DATA_FIELD_TEMPLATE, additionalData));
        
        // Adiciona o ID do CRC16, a string com "6304" ao final é exigida para calcular o hash
        payload.append(ID_CRC16).append("04");
        
        String crc = calculateCRC16(payload.toString());
        payload.append(crc);
        
        return payload.toString();
    }

    private static String formatValue(String id, String value) {
        String length = String.format("%02d", value.length());
        return id + length + value;
    }

    /**
     * Calcula o CRC16 (Polynomial 0x1021, Initial 0xFFFF) do payload conforme padrão do BACEN.
     */
    private static String calculateCRC16(String payload) {
        int crc = 0xFFFF;
        int polynomial = 0x1021;
        
        byte[] bytes = payload.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        for (byte b : bytes) {
            crc ^= (b << 8);
            for (int i = 0; i < 8; i++) {
                if ((crc & 0x8000) != 0) {
                    crc = (crc << 1) ^ polynomial;
                } else {
                    crc <<= 1;
                }
            }
        }
        crc &= 0xFFFF;
        return String.format("%04X", crc);
    }
}
