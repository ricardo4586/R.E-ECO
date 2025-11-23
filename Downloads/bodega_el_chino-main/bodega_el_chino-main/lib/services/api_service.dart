import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // Configuración centralizada de URLs - RUTAS EN ESPAÑOL
  static const String baseUrl = 'http://192.168.1.35:3000/api';

  // Headers comunes
  static const Map<String, String> headers = {
    'Content-Type': 'application/json',
  };

  // -------------------------------------------------------------------------
  // PRODUCTOS - RUTAS EN ESPAÑOL (EXACTAS)
  // -------------------------------------------------------------------------

  /// Buscar producto por código de barras
  static Future<Map<String, dynamic>> searchProduct(String barcode) async {
    print('🔍 [ApiService] Buscando producto: $barcode');
    print('🌐 [ApiService] URL: $baseUrl/productos/buscar/$barcode');
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/productos/buscar/$barcode'),
        headers: headers,
      );

      print('📡 [ApiService] Respuesta - Status: ${response.statusCode}');
      print('📡 [ApiService] Respuesta - Body: ${response.body}');

      return _handleResponse(response);
    } catch (e) {
      print('❌ [ApiService] Error de conexión: $e');
      return _handleError(e);
    }
  }

  /// Enviar código de barras escaneado
  static Future<Map<String, dynamic>> sendBarcodeScan(String barcode) async {
    print('📦 [ApiService] Enviando código escaneado: $barcode');
    
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/productos/escaneo'),
        headers: headers,
        body: json.encode({
          'codigo_barras': barcode,
        }),
      );

      print('📡 [ApiService] Escaneo - Status: ${response.statusCode}');
      print('📡 [ApiService] Escaneo - Body: ${response.body}');

      return _handleResponse(response);
    } catch (e) {
      print('❌ [ApiService] Error al enviar escaneo: $e');
      return _handleError(e);
    }
  }

  /// Obtener catálogo de productos activos - RUTA CORREGIDA
  static Future<Map<String, dynamic>> getCatalog() async {
    print('📚 [ApiService] Obteniendo catálogo...');
    print('🌐 [ApiService] URL EXACTA: $baseUrl/productos/catalogo');
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/productos/catalogo'),
        headers: headers,
      );

      print('📡 [ApiService] Catálogo - Status: ${response.statusCode}');
      print('📡 [ApiService] Catálogo - Body: ${response.body}');
      
      return _handleResponse(response);
    } catch (e) {
      print('❌ [ApiService] Error al obtener catálogo: $e');
      return _handleError(e);
    }
  }

  /// Obtener productos pendientes
  static Future<Map<String, dynamic>> getPendingProducts() async {
    print('⏳ [ApiService] Obteniendo productos pendientes...');
    
    try {
      final response = await http.get(
        Uri.parse('$baseUrl/productos/pendientes'),
        headers: headers,
      );

      print('📡 [ApiService] Pendientes - Status: ${response.statusCode}');
      
      return _handleResponse(response);
    } catch (e) {
      print('❌ [ApiService] Error al obtener pendientes: $e');
      return _handleError(e);
    }
  }

  /// Crear o actualizar producto completo
  static Future<Map<String, dynamic>> saveProduct(Map<String, dynamic> productData) async {
    print('💾 [ApiService] Guardando producto: ${productData['nombre']}');
    
    try {
      final String productId = productData['id_producto']?.toString() ?? '';
      final bool isUpdate = productId.isNotEmpty;

      final response = await (isUpdate
          ? http.put(
              Uri.parse('$baseUrl/productos/$productId'),
              headers: headers,
              body: json.encode(productData),
            )
          : http.post(
              Uri.parse('$baseUrl/productos'),
              headers: headers,
              body: json.encode(productData),
            ));

      print('📡 [ApiService] Guardar - Status: ${response.statusCode}');
      print('📡 [ApiService] Guardar - Body: ${response.body}');

      return _handleResponse(response);
    } catch (e) {
      print('❌ [ApiService] Error al guardar producto: $e');
      return _handleError(e);
    }
  }

  // -------------------------------------------------------------------------
  // AUTENTICACIÓN
  // -------------------------------------------------------------------------

  static Future<Map<String, dynamic>> login(String email, String password) async {
    print('🔐 [ApiService] Login: $email');
    
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/login'),
        headers: headers,
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      return _handleResponse(response);
    } catch (e) {
      print('❌ [ApiService] Error en login: $e');
      return _handleError(e);
    }
  }

  static Future<Map<String, dynamic>> register(String email, String password) async {
    print('👤 [ApiService] Registro: $email');
    
    try {
      final response = await http.post(
        Uri.parse('$baseUrl/auth/register'),
        headers: headers,
        body: json.encode({
          'email': email,
          'password': password,
        }),
      );

      return _handleResponse(response);
    } catch (e) {
      print('❌ [ApiService] Error en registro: $e');
      return _handleError(e);
    }
  }

  // -------------------------------------------------------------------------
  // MANEJO DE RESPUESTAS Y ERRORES - MEJORADO
  // -------------------------------------------------------------------------

  static Map<String, dynamic> _handleResponse(http.Response response) {
    try {
      final dynamic data = json.decode(response.body);

      // Si la respuesta es una lista directa (como en /catalogo)
      if (data is List) {
        return {
          'success': true,
          'data': data,
          'message': 'Productos obtenidos exitosamente',
        };
      }

      switch (response.statusCode) {
        case 200:
        case 201:
          print('✅ [ApiService] Operación exitosa');
          return {
            'success': true,
            'data': data is Map ? (data['data'] ?? data) : data,
            'message': data is Map ? (data['message'] ?? 'Operación exitosa') : 'Operación exitosa',
          };
        case 400:
          print('⚠️ [ApiService] Error 400 - Solicitud incorrecta');
          return {
            'success': false,
            'message': data is Map ? (data['message'] ?? 'Solicitud incorrecta') : 'Solicitud incorrecta',
            'error': 'BAD_REQUEST',
          };
        case 404:
          print('🔍 [ApiService] Error 404 - No encontrado');
          return {
            'success': false,
            'message': data is Map ? (data['message'] ?? 'Recurso no encontrado') : 'Recurso no encontrado',
            'error': 'NOT_FOUND',
          };
        case 500:
          print('🚨 [ApiService] Error 500 - Servidor');
          return {
            'success': false,
            'message': data is Map ? (data['message'] ?? 'Error interno del servidor') : 'Error interno del servidor',
            'error': 'SERVER_ERROR',
          };
        default:
          print('❓ [ApiService] Error desconocido: ${response.statusCode}');
          return {
            'success': false,
            'message': 'Error desconocido: ${response.statusCode}',
            'error': 'UNKNOWN_ERROR',
          };
      }
    } catch (e) {
      print('🔄 [ApiService] Error al parsear respuesta: $e');
      return {
        'success': false,
        'message': 'Error al procesar respuesta del servidor',
        'error': 'PARSE_ERROR',
      };
    }
  }

  static Map<String, dynamic> _handleError(dynamic error) {
    print('🌐 [ApiService] Error de red: $error');
    return {
      'success': false,
      'message': 'Error de conexión: $error',
      'error': 'NETWORK_ERROR',
    };
  }

  // -------------------------------------------------------------------------
  // UTILIDADES
  // -------------------------------------------------------------------------

  /// Verificar conexión con el servidor
  static Future<bool> checkConnection() async {
    print('🔌 [ApiService] Verificando conexión con: http://192.168.1.35:3000/');
    
    try {
      final response = await http.get(
        Uri.parse('http://192.168.1.35:3000/'),
        headers: headers,
      ).timeout(Duration(seconds: 5));
      
      final bool isConnected = response.statusCode == 200;
      print('📡 [ApiService] Estado conexión: ${isConnected ? "✅ CONECTADO" : "❌ DESCONECTADO"}');
      
      return isConnected;
    } catch (e) {
      print('❌ [ApiService] No se pudo conectar al servidor: $e');
      return false;
    }
  }

  /// Diagnóstico de endpoints
  static Future<void> diagnoseEndpoints() async {
    print('🩺 DIAGNÓSTICO DE RUTAS EN ESPAÑOL...');
    
    final endpoints = [
      'http://192.168.1.35:3000/',
      'http://192.168.1.35:3000/api',
      '$baseUrl/productos/catalogo',
      '$baseUrl/productos/activos',
      '$baseUrl/productos/pendientes',
      '$baseUrl/auth/login',
    ];
    
    for (final endpoint in endpoints) {
      try {
        final response = await http.get(Uri.parse(endpoint));
        print('🌐 $endpoint: Status ${response.statusCode}');
        if (response.statusCode == 200) {
          print('✅✅✅ RUTA FUNCIONA: $endpoint');
        }
      } catch (e) {
        print('❌ $endpoint: Error $e');
      }
    }
  }
}