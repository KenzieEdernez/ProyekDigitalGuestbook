@@
-            {showCamera && guest ? (
+            {showCamera && guest ? (
               <CameraCapture
                 compact
                 autoStart
                 onCapture={handleCheckIn}
                 onCancel={() => setShowCamera(false)}
               />
             ) : (
-              <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-xl bg-navy-900/5 text-stone-400">
-                <Search className="mb-4 h-12 w-12 opacity-30" />
-                <p className="text-sm">Scan QR tamu untuk mulai</p>
-              </div>
+              // show QR camera scanner when no guest selected
+              <div>
+                <div className="flex aspect-[3/4] items-center justify-center rounded-xl bg-navy-900/5 text-stone-400">
+                  {/* QR camera will mount here */}
+                  <div style={{ width: '100%' }}>
+                    <QRScanner
+                      onDetected={(code) => {
+                        // set scanValue for UI and trigger handleScan
+                        setScanValue(code);
+                        handleScan(code);
+                      }}
+                      prompt="Arahkan scanner ke QR code undangan tamu"
+                      autoStart={true}
+                    />
+                  </div>
+                </div>
+              </div>
             )}
@@
-import CameraCapture from "@/components/CameraCapture";
+import CameraCapture from "@/components/CameraCapture";
+import QRScanner from "@/components/QRScanner";
@@
