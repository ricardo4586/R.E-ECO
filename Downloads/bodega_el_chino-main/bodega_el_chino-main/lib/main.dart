// Importaciones de Flutter y paquetes necesarios
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';

// Definición de Roles
enum UserRole { admin, user, none }

// -----------------------------------------------------------------------------
// 1. MODELO DE DATOS
// -----------------------------------------------------------------------------

/// Modelo para un producto escaneado o registrado.
class Product {
  final String barcode;
  final String name;
  final String brand;
  final double price; // Precio simulado para el totalizador

  Product({
    required this.barcode,
    required this.name,
    required this.brand,
    required this.price,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    // Extracción de datos de Open Food Facts
    final product = json['product'] ?? {};
    
    // Generar un precio simulado basado en el código de barras para el totalizador.
    // Esto es solo para fines de demostración.
    final simulatedPrice = (json['code']?.hashCode ?? 1) % 20 + 5.0; // Precio entre 5 y 24
    
    return Product(
      barcode: json['code'] ?? 'N/A',
      name: product['product_name'] ?? 'Producto Desconocido',
      brand: product['brands'] ?? 'Marca Desconocida',
      price: simulatedPrice.toDouble(),
    );
  }

  // Constructor para productos registrados manualmente por el Admin
  Product.manual({
    required this.barcode,
    required this.name,
    required this.brand,
    required this.price,
  });
}

// -----------------------------------------------------------------------------
// 2. SERVICIO DE API (Simulación Tottus / Uso de Open Food Facts)
// -----------------------------------------------------------------------------

class ProductApiService {
  static const String _baseUrl = 'https://world.openfoodfacts.org/api/v0/product/';

  /// Busca un producto por su código de barras usando Open Food Facts.
  Future<Product?> fetchProduct(String barcode) async {
    final uri = Uri.parse('$_baseUrl$barcode.json');
    try {
      final response = await http.get(uri);

      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['status'] == 1) { // 1 means product found
          return Product.fromJson(data);
        } else {
          // Producto no encontrado en la API externa
          return null;
        }
      }
    } catch (e) {
      // Manejo de errores de red o parsing
      print('Error al buscar producto: $e');
    }
    return null;
  }
}

// -----------------------------------------------------------------------------
// 3. GESTIÓN DE ESTADO (Provider)
// -----------------------------------------------------------------------------

class AppState extends ChangeNotifier {
  UserRole _currentRole = UserRole.none;
  final ProductApiService _apiService = ProductApiService();
  
  // Base de datos simulada para productos registrados por el Admin
  final Map<String, Product> _storedProducts = {};
  
  // Carrito para la funcionalidad de escaneo por lotes
  final List<Product> _cart = [];

  UserRole get currentRole => _currentRole;
  List<Product> get cart => _cart;
  Map<String, Product> get storedProducts => _storedProducts;

  /// Simula el inicio de sesión y establece el rol.
  void login(UserRole role) {
    _currentRole = role;
    notifyListeners();
  }

  /// Cierra la sesión y vuelve a la pantalla de login.
  void logout() {
    _currentRole = UserRole.none;
    _cart.clear(); // Limpia el carrito al cerrar sesión
    notifyListeners();
  }

  /// Busca un producto, primero en la BD simulada, luego en la API externa.
  Future<Product?> searchProduct(String barcode) async {
    // 1. Buscar en la base de datos simulada
    if (_storedProducts.containsKey(barcode)) {
      return _storedProducts[barcode];
    }

    // 2. Buscar en la API externa
    final product = await _apiService.fetchProduct(barcode);
    
    // Si se encuentra en la API, lo guardamos temporalmente en la BD simulada
    // para acelerar futuras búsquedas.
    if (product != null) {
      _storedProducts[barcode] = product;
    }

    return product;
  }
  
  /// Permite al Admin registrar un producto no encontrado.
  void registerProduct(Product product) {
    _storedProducts[product.barcode] = product;
    notifyListeners();
  }

  /// Añade un producto al carrito (usado en BatchScanScreen).
  void addToCart(Product product) {
    _cart.add(product);
    notifyListeners();
  }

  /// Limpia el carrito actual.
  void clearCart() {
    _cart.clear();
    notifyListeners();
  }

  /// Calcula el total del carrito.
  double get cartTotal => _cart.fold(0.0, (sum, item) => sum + item.price);
}

// -----------------------------------------------------------------------------
// 4. ESTRUCTURA PRINCIPAL DE LA APLICACIÓN
// -----------------------------------------------------------------------------

void main() {
  runApp(
    // Envolvemos la app con ChangeNotifierProvider para la gestión de estado.
    ChangeNotifierProvider(
      create: (context) => AppState(),
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Bodega El Chino',
      theme: ThemeData(
        primarySwatch: Colors.green,
        visualDensity: VisualDensity.adaptivePlatformDensity,
        fontFamily: 'Inter',
        useMaterial3: true,
      ),
      home: const AuthWrapper(),
    );
  }
}

/// Widget que maneja la navegación según el estado de autenticación/rol.
class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    
    switch (appState.currentRole) {
      case UserRole.none:
        return const LoginScreen();
      case UserRole.admin:
        return const AdminHomeScreen();
      case UserRole.user:
        return const UserScannerScreen();
    }
  }
}

// -----------------------------------------------------------------------------
// 5. PANTALLA DE INICIO DE SESIÓN
// -----------------------------------------------------------------------------

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context, listen: false);

    return Scaffold(
      appBar: AppBar(title: const Text('Bodega El Chino - Login')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              const Text(
                'Selecciona tu Rol',
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 40),
              ElevatedButton.icon(
                icon: const Icon(Icons.admin_panel_settings),
                label: const Text('Ingresar como ADMINISTRADOR', style: TextStyle(fontSize: 18)),
                onPressed: () => appState.login(UserRole.admin),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade700,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
              ),
              const SizedBox(height: 20),
              OutlinedButton.icon(
                icon: const Icon(Icons.person),
                label: const Text('Ingresar como USUARIO', style: TextStyle(fontSize: 18)),
                onPressed: () => appState.login(UserRole.user),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 15, horizontal: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  side: BorderSide(color: Colors.green.shade700, width: 2),
                ),
              ),
              const SizedBox(height: 40),
              Text(
                'Simulación de Roles: No requiere credenciales reales.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey.shade600),
              )
            ],
          ),
        ),
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 6. PANTALLAS DE USUARIO
// -----------------------------------------------------------------------------

/// Pantalla principal para el rol USUARIO. Solo permite escanear para ver info.
class UserScannerScreen extends StatelessWidget {
  const UserScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Modo Usuario (Consulta Rápida)'),
        backgroundColor: Colors.green,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Provider.of<AppState>(context, listen: false).logout(),
          )
        ],
      ),
      body: ProductScanner(
        isAdmin: false,
        onProductFound: (product) {
          _showProductDetails(context, product);
        },
        onProductNotFound: (barcode) {
          _showInfoDialog(
            context,
            'Producto no encontrado',
            'El código $barcode no se encontró en la base de datos.',
          );
        },
        onRegistrationNeeded: (barcode) {
          // El usuario no puede registrar, solo se informa
          _showInfoDialog(
            context,
            'No Autorizado',
            'Como Usuario, no puedes registrar nuevos productos. Código: $barcode',
          );
        },
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 7. PANTALLAS DE ADMINISTRADOR
// -----------------------------------------------------------------------------

/// Pantalla de navegación principal para el rol ADMINISTRADOR.
class AdminHomeScreen extends StatelessWidget {
  const AdminHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Bodega El Chino - Administrador'),
        backgroundColor: Colors.green.shade800,
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => Provider.of<AppState>(context, listen: false).logout(),
          )
        ],
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: <Widget>[
            _buildAdminActionCard(
              context,
              icon: Icons.qr_code_scanner,
              title: 'Escaneo y Registro de Productos',
              subtitle: 'Consulta información o registra productos nuevos.',
              targetScreen: AdminScannerScreen(),
            ),
            _buildAdminActionCard(
              context,
              icon: Icons.point_of_sale,
              title: 'Punto de Venta (Totalizador)',
              subtitle: 'Escanea varios productos y suma el total.',
              targetScreen: const BatchScanScreen(),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildAdminActionCard(BuildContext context, {required IconData icon, required String title, required String subtitle, required Widget targetScreen}) {
    return Card(
      margin: const EdgeInsets.all(16.0),
      elevation: 8,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      child: ListTile(
        contentPadding: const EdgeInsets.all(20),
        leading: Icon(icon, size: 40, color: Colors.green.shade700),
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        subtitle: Padding(
          padding: const EdgeInsets.only(top: 8.0),
          child: Text(subtitle),
        ),
        trailing: const Icon(Icons.arrow_forward_ios),
        onTap: () {
          Navigator.of(context).push(MaterialPageRoute(builder: (context) => targetScreen));
        },
      ),
    );
  }
}

/// Pantalla de escaneo para el rol ADMINISTRADOR (con opción a registro).
class AdminScannerScreen extends StatelessWidget {
  AdminScannerScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Admin: Escaneo y Registro'),
        backgroundColor: Colors.green.shade700,
      ),
      body: ProductScanner(
        isAdmin: true,
        onProductFound: (product) {
          _showProductDetails(context, product);
        },
        onProductNotFound: (barcode) {
          _showRegistrationDialog(context, barcode);
        },
        onRegistrationNeeded: (barcode) {
          // Ya manejado por onProductNotFound
        },
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 8. PANTALLA DE REGISTRO MANUAL (ADMIN)
// -----------------------------------------------------------------------------

/// Muestra un diálogo para que el Admin registre un producto nuevo.
void _showRegistrationDialog(BuildContext context, String barcode) {
  Navigator.of(context).push(
    MaterialPageRoute(
      builder: (context) => ProductRegistrationScreen(barcode: barcode),
    ),
  );
}

class ProductRegistrationScreen extends StatefulWidget {
  final String barcode;
  const ProductRegistrationScreen({super.key, required this.barcode});

  @override
  State<ProductRegistrationScreen> createState() => _ProductRegistrationScreenState();
}

class _ProductRegistrationScreenState extends State<ProductRegistrationScreen> {
  final _formKey = GlobalKey<FormState>();
  String _name = '';
  String _brand = '';
  double? _price;

  void _submitRegistration() {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      final newProduct = Product.manual(
        barcode: widget.barcode,
        name: _name,
        brand: _brand,
        price: _price!,
      );
      
      Provider.of<AppState>(context, listen: false).registerProduct(newProduct);
      
      _showInfoDialog(context, '¡Registro Exitoso!', 'El producto "${newProduct.name}" ha sido guardado localmente.');
      Navigator.of(context).pop();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Registrar Nuevo Producto'),
        backgroundColor: Colors.orange,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20.0),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: <Widget>[
              Text(
                'Código de Barras: ${widget.barcode}',
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 20),
              _buildTextFormField(
                label: 'Nombre del Producto',
                validator: (value) => value!.isEmpty ? 'El nombre es obligatorio' : null,
                onSaved: (value) => _name = value!,
              ),
              const SizedBox(height: 15),
              _buildTextFormField(
                label: 'Marca',
                validator: (value) => value!.isEmpty ? 'La marca es obligatoria' : null,
                onSaved: (value) => _brand = value!,
              ),
              const SizedBox(height: 15),
              _buildTextFormField(
                label: 'Precio (Soles)',
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (value) {
                  if (value!.isEmpty) return 'El precio es obligatorio';
                  if (double.tryParse(value) == null) return 'Ingresa un número válido';
                  return null;
                },
                onSaved: (value) => _price = double.tryParse(value!),
              ),
              const SizedBox(height: 30),
              ElevatedButton.icon(
                icon: const Icon(Icons.save),
                label: const Text('Guardar Producto'),
                onPressed: _submitRegistration,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.orange.shade700,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 15),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildTextFormField({
    required String label,
    required FormFieldValidator<String> validator,
    required FormFieldSetter<String> onSaved,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextFormField(
      decoration: InputDecoration(
        labelText: label,
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
        contentPadding: const EdgeInsets.symmetric(horizontal: 15, vertical: 15),
      ),
      keyboardType: keyboardType,
      validator: validator,
      onSaved: onSaved,
    );
  }
}

// -----------------------------------------------------------------------------
// 9. PANTALLA DE ESCANEO POR LOTES / TOTALIZADOR
// -----------------------------------------------------------------------------

class BatchScanScreen extends StatelessWidget {
  const BatchScanScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Totalizador de Venta'),
        backgroundColor: Colors.blue.shade700,
      ),
      body: Column(
        children: <Widget>[
          Expanded(
            flex: 3,
            child: Consumer<AppState>(
              builder: (context, appState, child) {
                return ProductScanner(
                  isAdmin: true, // El Batch Scan necesita acceso a la BD Admin
                  onProductFound: (product) {
                    appState.addToCart(product);
                  },
                  onProductNotFound: (barcode) {
                    _showInfoDialog(
                      context,
                      'Producto Desconocido',
                      'El producto con código $barcode no fue encontrado. Regístralo primero en la opción "Escaneo y Registro".',
                    );
                  },
                  onRegistrationNeeded: (barcode) {
                    // No se permite registro directo desde aquí
                  },
                );
              },
            ),
          ),
          Expanded(
            flex: 2,
            child: CartSummary(),
          ),
        ],
      ),
    );
  }
}

/// Resumen del Carrito y Total.
class CartSummary extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context);
    
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Artículos Escaneados:',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: appState.cart.length,
              itemBuilder: (context, index) {
                final item = appState.cart[index];
                return ListTile(
                  title: Text(item.name),
                  subtitle: Text(item.brand),
                  trailing: Text('S/. ${item.price.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
                );
              },
            ),
          ),
          const Divider(),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('TOTAL A PAGAR:', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.blue)),
              Text('S/. ${appState.cartTotal.toStringAsFixed(2)}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.blue)),
            ],
          ),
          const SizedBox(height: 10),
          ElevatedButton.icon(
            icon: const Icon(Icons.check_circle_outline),
            label: const Text('Finalizar Venta / Limpiar Carrito', style: TextStyle(fontSize: 18)),
            onPressed: () {
              appState.clearCart();
              _showInfoDialog(context, 'Venta Finalizada', 'El carrito ha sido limpiado. Total: S/. ${appState.cartTotal.toStringAsFixed(2)}');
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.green,
              foregroundColor: Colors.white,
              padding: const EdgeInsets.symmetric(vertical: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            ),
          ),
        ],
      ),
    );
  }
}

// -----------------------------------------------------------------------------
// 10. WIDGET DE ESCÁNER REUTILIZABLE
// -----------------------------------------------------------------------------

class ProductScanner extends StatefulWidget {
  final bool isAdmin;
  final Function(Product) onProductFound;
  final Function(String) onProductNotFound;
  final Function(String) onRegistrationNeeded;

  const ProductScanner({
    super.key,
    required this.isAdmin,
    required this.onProductFound,
    required this.onProductNotFound,
    required this.onRegistrationNeeded,
  });

  @override
  State<ProductScanner> createState() => _ProductScannerState();
}

class _ProductScannerState extends State<ProductScanner> {
  bool _isScanning = true;
  String _scanResult = 'Esperando código...';
  
  @override
  void initState() {
    super.initState();
    // Iniciar el escaneo al cargar la pantalla
    setState(() => _isScanning = true);
  }

  void _onBarcodeDetected(BarcodeCapture capture, AppState appState) async {
    if (!_isScanning) return;
    
    final barcode = capture.barcodes.first.rawValue;
    if (barcode == null) return;

    setState(() {
      _isScanning = false; // Detiene el escaneo temporalmente
      _scanResult = 'Escaneado: $barcode. Buscando...';
    });

    final product = await appState.searchProduct(barcode);

    if (mounted) {
      if (product != null) {
        widget.onProductFound(product);
      } else {
        if (widget.isAdmin) {
          widget.onProductNotFound(barcode); // Llama a la lógica de registro o aviso del Admin
        } else {
          widget.onRegistrationNeeded(barcode); // Llama al aviso del Usuario
        }
      }

      // Vuelve a habilitar el escaneo después de un pequeño retraso
      Future.delayed(const Duration(seconds: 2), () {
        if (mounted) {
          setState(() {
            _isScanning = true;
            _scanResult = 'Listo para escanear el siguiente...';
          });
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final appState = Provider.of<AppState>(context, listen: false);

    return Column(
      children: <Widget>[
        Expanded(
          child: MobileScanner(
            key: ValueKey(_isScanning), // Key para forzar la reconstrucción si es necesario
            onDetect: (capture) => _onBarcodeDetected(capture, appState),
            controller: MobileScannerController(
              detectionSpeed: DetectionSpeed.normal,
              autoStart: true,
              torchEnabled: false,
            ),
            fit: BoxFit.cover,
            errorBuilder: (context, error, child) {
              return Center(child: Text('Error de cámara: $error'));
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16.0),
          width: double.infinity,
          color: Colors.black87,
          child: Text(
            _isScanning ? 'Punto de mira: Escaneando...' : _scanResult,
            style: const TextStyle(color: Colors.white, fontSize: 16),
            textAlign: TextAlign.center,
          ),
        ),
      ],
    );
  }
}

// -----------------------------------------------------------------------------
// 11. UTILIDADES (Diálogos)
// -----------------------------------------------------------------------------

/// Muestra un diálogo con los detalles del producto.
void _showProductDetails(BuildContext context, Product product) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      title: Text(product.name, style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.green)),
      content: SingleChildScrollView(
        child: ListBody(
          children: <Widget>[
            Text('Marca: ${product.brand}'),
            const Divider(),
            Text('Código de Barras: ${product.barcode}'),
            Text('Precio Sugerido: S/. ${product.price.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
          ],
        ),
      ),
      actions: <Widget>[
        TextButton(
          child: const Text('Cerrar', style: TextStyle(color: Colors.green)),
          onPressed: () {
            Navigator.of(context).pop();
          },
        ),
      ],
    ),
  );
}

/// Muestra un diálogo de información general (sustituto de alert()).
void _showInfoDialog(BuildContext context, String title, String content) {
  showDialog(
    context: context,
    builder: (context) => AlertDialog(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
      title: Text(title),
      content: Text(content),
      actions: <Widget>[
        TextButton(
          child: const Text('OK'),
          onPressed: () => Navigator.of(context).pop(),
        ),
      ],
    ),
  );
}